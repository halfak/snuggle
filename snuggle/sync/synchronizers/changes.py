import logging, time, traceback

from snuggle import mediawiki
from snuggle.data import types
from snuggle.util import import_class

from .synchronizer import Synchronizer

logger = logging.getLogger("snuggle.sync.synchronizers.changes")


class Changes(Synchronizer): 
	"""
	Synchronizes from a recent changes feed.
	
	TODO: threading
	"""
	def __init__(self, model, changes, mwapi, 
		     loop_delay, changes_per_request, max_age, starting_rcid):
		"""
		:Parameters:
			model: `snuggle.data.models.Model`
			source: `snuggle.data.models.Source`
			mwapi: `snuggle.mediawiki.API`
			loop_delay: int
			changes_per_request: int
			max_age: int
			starting_rcid: int
		"""
		Synchronizer.__init__(self)
		self.daemon = True
		
		# Resources
		self.model  = model
		self.source = source
		self.mwapi  = mwapi
		
		# Behavioral parameters
		self.loop_delay = loop_delay
		self.changes_per_request = changes_per_request
		self.max_age = max_age
		self.starting_rcid = starting_rcid
		
		# Status
		self.up = False
		self.stop_requested = False
		
	def run(self):
		# Status
		self.up = True
		self.processed_revision = 0
		self.processed_users = 0
		self.up_timestamp = time.time()
		
		last_change = self.model.changes.last()
		last_rcid = max(
			last_change.id if last_change != None else 0, 
			self.starting_rcid
		)
		last_timestamp = None
		
		while not self.stop_requested:
			# Get the time
			start = time.time()
			
			# Get changes
			changes = self.changes.read(
				last_rcid, 
				self.changes_per_request
			)
			
			# Apply changes
			for id, timestamp in self.__apply(changes):
				last_rcid = id
				last_timestamp = timestamp
			
			# Discard old
			if last_timestamp is not None:
				self.model.cull(last_timestamp - self.max_age)
			
			# Sleep for all of the time that we haven't used
			time.sleep(max(self.loop_delay - (time.time() - start), 0))
			
		
		logger.info(
			"Stopped processing recent changes. " +
			"(last_rcid=%s, last_timestamp=%s)" % (
				last_rcid, last_timestamp
			)
		)
		self.up = False
	
	def stop(self):
		logger.info("Stop request recieved.")
		self.stop_requested = True
	
	def status(self):
		if self.up:
			return (
				"Online.\n" + 
				"\tNew users: %s \n" + 
				"\tRevisions: %s \n" + 
				"\tUptime: %s hours."
			) % (
				self.processed_users, 
				self.processed_revisions, 
				round(
					(time.time() - self.up_timestamp) / 
					(60*60.0),
					2
				)
			)
		else:
			return "Offline"
		
	def __apply(self, changes):
		successful = 0
		errored    = 0
		irrelevant = 0
		
		for change in changes:
			try:
				if self.__apply_change(change):
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
			self.__update_reverted(reverted, revision)
			relevant = True
		
		# Check if this revision was made by one of our users
		if revision.user.id in self.model.users:
			self.__add_revision_for_user(revision)
			relevant = True
		
		# Check if this revision was an edit to one of our users' talk
		# pages or user pages.
		if revision.page.title in self.model.talks:
			
			if revision.page.namespace == 3:
				self.__update_talk(revision)
				relevant = True
			elif revision.page.namespace == 2:
				self.__update_user_page(revision)
				relevant = True
		
		return relevant
	
	def __update_reverted(self, reverted, revision):
		logger.debug(
			"Updating reverted status of %s for %s." % (
				reverted.revision.id, reverted.revision.user.name
			)
		)
		if reverted.check(revision): #Reverted!
			self.model.users.set_reverted(
				reverted.revision.user_id,
				reverted.revision.id,
				revision
			)
			self.model.reverteds.remove(reverted.id)
			logging.debug("Revision %s by %s was reverted by %s" % (
					reverted.revision.id,
					reverted.revision.user.id,
					revision.user.id
				)
			)
			
		if reverted.done():
			self.model.reverteds.remove(reverted)
			logging.debug("Completed processing revisions for %s" % reverted.id)
		else:
			self.model.reverted.update(reverted)
	
	def __add_revision_for_user(self, revision):
		logger.debug(
			"Adding revision %s for %s." % (
				revision.id, revision.user.name
			)
		)
		user = self.model.users.add_revision(revision)
		
		reverted = types.Reverted(
			revision, 
			self.source.history(
				revision.page.id, 
				revision.id, 
				types.Reverted.HISTORY_LIMIT
			)
		)
		self.model.reverteds.new(reverted)
		
		score = types.Score(
			revision.id,
			revision.user
		)
		self.model.scores.new(score)
	
	def __update_talk(self, revision):
		logger.debug(
			"Setting talk page for %s." % revision.page.title
		)
		self.model.users.set_talk_page(revision.page.title)
		
		try:
			talk = self.model.user.get_talk(title=revision.page.title)
			if talk.last_id < revision.id:
				logger.debug("Getting markup for %s." % revision.page.title)
				id, markup = self.mwapi.pages.get_markup(title="User_talk:" + revision.page.title)
				talk.update(id, markup)
			
		except KeyError as e:
			pass
		
		
	def __update_user_page(self, revision):
		logger.debug(
			"Setting user page for %s." % revision.page.title
		)
		self.model.users.set_user_page(revision.page.title)
	
	@staticmethod
	def from_config(doc, model):
		Changes = import_class(doc['changes']['module'])
		
		return RecentChanges(
			model,
			Changes.from_config(doc),
			mediawiki.API.from_config(doc),
			doc[section]['loop_delay'],
			doc[section]['changes_per_request'],
			doc[section]['max_age'],
			doc[section]['starting_rcid']
		)
			
