import pymongo, logging

from .changes import Changes
from .events import Events
from .users import Users
from .reverteds import Reverteds
from .scores import Scores

from snuggle.mediawiki import threads

logger = logging.getLogger("snuggle.data.models.mongo")

class Mongo:
	
	def __init__(self, db, thread_parser):
		self.db            = db
		self.thread_parser = thread_parser
		
		self.changes   = Changes(self)
		self.events    = Events(self)
		self.reverteds = Reverteds(self)
		self.scores    = Scores(self)
		self.users     = Users(self)
	
	
	def cull(self, older_than):
		deaths = [doc['_id'] for doc in self.db.users.find({'registration': {"$lt": older_than}})]
		
		self.db.users.remove({'_id': {"$in": deaths}})
		self.db.reverteds.remove({'revision.user.id': {'$in': deaths}})
		self.db.changes.remove({'timestamp': {"$lt": older_than}})
		self.db.scores.remove({'user_id': {'$in': deaths}})
	
	@staticmethod
	def from_config(config):
		
		logger.info(
			"Mongo(host=%(host)s, port=%(port)s, db=%(database)s)" % config.snuggle['model']
		)
		
		return Mongo(
			pymongo.MongoClient(
				host=config.snuggle['model']['host'],
				port=config.snuggle['model']['port']
			)[config.snuggle['model']['database']],
			threads.Parser.from_config(config)
		)
	
