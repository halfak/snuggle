import pymongo, logging

from .changes import Changes
from .events import Events
from .users import Users
from .reverteds import Reverteds
from .scores import Scores

from snuggle.mediawiki import threads

logger = logging.getLogger("snuggle.data.models.mongo")

class Mongo:
	
	def __init__(self, host, port, name, thread_parser):
		self._db           = None
		self.host          = host
		self.port          = port
		self.name          = name
		self.thread_parser = thread_parser
		
		self.changes   = Changes(self)
		self.events    = Events(self)
		self.reverteds = Reverteds(self)
		self.scores    = Scores(self)
		self.users     = Users(self)

	@property
	def db(self):
		if self._db is None:
			self._db = pymongo.MongoClient(
                                host=self.host,
                                port=self.port
                        )[self.name]
		return self._db
	
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
			host=config.snuggle['model']['host'],
			port=config.snuggle['model']['port'],
			name=config.snuggle['model']['database'],
			thread_parser=threads.Parser.from_config(config)
		)
	
