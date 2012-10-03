import traceback, logging
import importlib

from data import types

def importClass(path):
	modules = path.split(".")
	
	try:
		module = importlib.import_module(".".join(modules[:-1]))
		return getattr(module, modules[-1])
	except ImportError as e:
		raise ImportError(str(e) + "(%s)" % path)
	

logger = logging.getLogger("snuggle.system")

class System:
	
	HISTORY_LIMIT = 15
	
	def __init__(self, model, source, mwapi, age, minId=0):
		self.model      = model
		self.source     = source
		self.mwapi      = mwapi
		self.minId      = minId
		self.age        = age
		
		self.last     = self.model.changes.last()
	
	def update(self, limit=None):
		if self.last != None:
			lastId = max(self.last.id, self.minId)
		else:
			lastId = self.minId
		
		logging.info("Running update (<= %s changes)." % limit)
		
		self.apply(self.source.changes(lastId, limit))
		
		logging.info("Cleaning up.")
		self.model.clean(self.last.timestamp - self.age)
		
	
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
					
				
				self.last = change
			except Exception as e:
				logger.error(traceback.format_exc())
				errored += 1
			
		logging.info("Applied %s changes successfully (%s errored, %s irrelevant)." % (successful, errored, irrelevant))
				
		
	def __apply(self, change):
		if change.type == "new user":
			return self.__newUser(change.change)
		elif change.type == "new revision":
			return self.__newRevision(change.change)
	
	def __newUser(self, user):
		logger.debug("New user %s." % user.deflate())
		#Save user
		self.model.users.new(user)
		
		#Every new user is a relevant change to capture
		return True
	
	def __newRevision(self, revision):
		relevant = False
		
		#Check if this revision was made by one of our users
		if revision.user.id in self.model.users:
			logger.debug("Adding revision %s for %s." % (revision.id, revision.user.name))
			user = self.model.users.get(revision.user.id)
			user.revision(revision)
			
			reverted = types.Reverted(
				revision, 
				self.source.history(revision.page.id, revision.id, self.HISTORY_LIMIT)
			)
			
			self.model.reverteds.new(reverted)
			
			relevant = True
		
		#Update for all revisions to a page that could have reverted one of our user's revisions
		for reverted in self.model.reverteds.get(revision.page.id):
			logger.debug("Updating reverted status of %s for %s." % (reverted.id, reverted.revision.user.name))
			reverted.process(revision)
			if reverted.complete(): logging.debug("Completed processing revisions for %s" % reverted.id)
			
			relevant = True
		
		#Check if revision to a talk page of one of our users
		if revision.page.namespace == 3 and revision.page.title in self.model.talks:
			talk = self.model.talks.get(revision.page.title)
			if talk.lastId < revision.id:
				logger.debug("Getting markup for %s." % revision.page.title)
				id, markup = self.mwapi.getMarkup(title="User_talk:" + revision.page.title)
				talk.update(id, markup)
			
			relevant = True
		
		return relevant
	
	@staticmethod
	def fromConfig(config):
		sourceSection = config.get("system", "source")
		source = importClass(config.get(sourceSection, "module"))
		
		modelSection = config.get("system", "model")
		model  = importClass(config.get(modelSection, "module"))
		
		apiSection = config.get("system", "api")
		api    = importClass(config.get(apiSection, "module"))
		
		return System(
			model.fromConfig(config, modelSection),
			source.fromConfig(config, sourceSection),
			api.fromConfig(config, apiSection),
			config.getint("system", "age"),
			config.getint("system", "min_id")
		)
			
