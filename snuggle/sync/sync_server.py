logger = logging.get("snuggle.sync.recent_changes")

class SyncServer:
	
	def __init__(self):
		raise NotImplementedError()
	
	def run(self):
		raise NotImplementedError()
	
	def stop(self):
		raise NotImplementedError()
	
	def status(self):
		raise NotImplementedError()
		
	

class Scores(Synchronizer):
	"""
	Synchronizes vandal scores for users' main namespace edits.
	
	TODO: threading
	"""
	def __init__(self, model, source, 
		sleep, scores_per_request, max_id_distance):
		self.model = model
		self.source = source
		
		self.sleep = sleep
		self.scores_per_request = scores_per_request
		self.max_id_distance    = max_id_distance
		
		self.stop_requested = False
	
	def run(self):
		#Status
		self.up = True
		self.requests_made = 0
		self.requests_fulfilled = 0
		self.scores_dropped = 0
		self.up_timestamp = time.time()
		
		while not self.stop_requested:
			#Get scores from model
			
			#Retrieve scores from source
			
			#Sleep for a bit
	
	
	def stop(self):
		logging.info("Stop request recieved.")
		self.stop_requested = True
	
	def status(self):
		if self.up:
			return "Online"
		else:
			return "Offline"
	

class RecentChanges:
	"""
	Synchronizes from a recent changes feed.
	
	TODO: threading
	"""
	def __init__(self, model, source, mwapi, 
		     sleep, changes_per_request, max_age, starting_rcid):
		"""
		:Parameters:
			model: `snuggle.data.models.Model`
			source: `snuggle.data.models.Source`
			mwapi: `snuggle.mediawiki.API`
			sleep: int
			changes_per_request: int
			max_age: int
			starting_rcid: int
		"""
		#Resources
		self.model  = model
		self.source = source
		self.mwapi  = mwapi
		
		#Behavioral parameters
		self.sleep = sleep
		self.changes_per_request = changes_per_request
		self.max_age = max_age
		self.starting_rcid = starting_rcid
		
		#Status
		self.up = False
		self.stop_requested = False
		
	def run(self):
		#Status
		self.up = True
		self.processed_revision = 0
		self.processed_users = 0
		self.up_timestamp = time.time()
		
		last_rcid = max(self.model.changes.last_rcid(), starting_rcid)
		last_timestamp = None
		
		while not self.stop_requested:
			#Get the time
			start = time.time()
			
			#Get changes
			changes = self.source.changes(
				last_rcid, 
				self.changes_per_request
			)
			
			#Apply changes
			for id, timestamp in self.apply(changes):
				last_rcid = id
				last_timestamp = timestamp
			
			#Discard old
			if last_timestamp is not None:
				self.model.cull(last_timestamp - max_age)
			
			#Sleep for all of the time that we haven't used
			time.sleep(sleep - (time.time() - start))
			
		
		logger.info(
			"Stopped processing recent changes. " +
			"(last_rcid=%s, last_timestamp=%s)" % (
				last_rcid, last_timestamp
			)
		)
		self.up = False
	
	def stop(self):
		logging.info("Stop request recieved.")
		self.stop_requested = True
	
	def status(self):
		if self.up:
			return (
				"Online.  %s new users, %s revisions " + 
				"processed in %s hours."
			) % (
				self.processed_users, 
				self.processed_revisions, 
				(time.time() - self.up_timestamp) / (60*60.0)
			)
		else:
			return "Offline"
		
	def apply(self, changes):
		successful = 0
		errored    = 0
		irrelevant = 0
		
		for change in changes:
			try:
				if self.__apply(change):
					successful += 1
					try:
						self.model.changes.record(change)
					except Exception as e:
						self.model.changes.record(change, str(e))
					
				else:
					irrelevant += 1
					
				
				yield change.id, change.timestamp
			except Exception as e:
				logger.error(traceback.format_exc())
				errored += 1
			
		logger.info("Applied %s changes successfully (%s errored, %s irrelevant)." % (successful, errored, irrelevant))
	
	def __apply_change(self, change):
		if change.type == "new user":
			return self.__new_user(change.change)
		elif change.type == "new revision":
			return self.__new_revision(change.change)
	
	def __new_user(self, user):
		logger.debug("New user %s." % user.deflate())
		
		# Save user
		self.model.users.new(user)
		
		# Every new user is a relevant change to capture
		return True
	
	def __new_revision(self, revision):
		relevant = False
		
		# Update for all revisions to a page that could have reverted 
		# one of our user's revisions
		for reverted in self.model.reverteds.get(revision.page.id):
			logger.debug(
				"Updating reverted status of %s for %s." % (
					reverted.id, reverted.revision.user.name
				)
			)
			reverted.process(revision)
			if reverted.complete(): logging.debug("Completed processing revisions for %s" % reverted.id)
			
			relevant = True
		
		# Check if this revision was made by one of our users
		if revision.user.id in self.model.users:
			logger.debug(
				"Adding revision %s for %s." % (
					revision.id, revision.user.name
				)
			)
			user = self.model.users.get(revision.user.id)
			user.revision(revision)
			
			reverted = types.Reverted(
				revision, 
				self.source.history(
					revision.page.id, 
					revision.id, 
					self.HISTORY_LIMIT
				)
			)
			self.model.reverteds.new(reverted)
			
			score = types.Score(
				revision.id,
				revision.user.id
			)
			self.model.scores.new(score)
			
			relevant = True
		
		#Check if revision to a talk page of one of our users
		if revision.page.namespace == 3 and revision.page.title in self.model.talks:
			talk = self.model.talks.get(revision.page.title)
			if talk.last_id < revision.id:
				logger.debug("Getting markup for %s." % revision.page.title)
				id, markup = self.mwapi.get_markup(title="User_talk:" + revision.page.title)
				talk.update(id, markup)
			
			relevant = True
		
		return relevant
	
	@staticmethod
	def fromConfig(config):
		sourceSection = config.get("system", "source")
		source = importClass(config.get(sourceSection, "module"))
		
		modelSection = config.get("system", "model")
		model  = importClass(config.get(modelSection, "module"))
		
		apiSection = config.get("system", "mwapi")
		mwapi    = importClass(config.get(apiSection, "module"))
		
		return System(
			model.fromConfig(config, modelSection),
			source.fromConfig(config, sourceSection),
			mwapi.fromConfig(config, apiSection),
			config.getint("system", "sleep"),
			config.getint("system", "changes_per_request"),
			config.getint("system", "max_age"),
			config.getint("system", "starting_rcid")
		)
			
