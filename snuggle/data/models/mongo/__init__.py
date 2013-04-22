import pymongo

from .changes import Changes
from .users import Users
from .reverteds import Reverteds
from .talks import Talks

class Mongo:
	
	def __init__(self, db):
		self.db          = db
		
		self.changes   = Changes(db)
		self.users     = Users(db)
		self.reverteds = Reverteds(db)
		self.talks     = Talks(db)
	
	
	def cull(self, older_than):
		deaths = [json['_id'] for json in self.db.users.find({'registration': {"$lt": older_than}})]
		
		self.db.users.remove({'_id': {"$in": deaths}})
		self.db.reverteds.remove({'revision.user._id': {'$in': deaths}})
		self.db.changes.remove({'timestamp': {"$lt": older_than}})
	
	@staticmethod
	def fromConfig(config, section):
		
		return Mongo(
			pymongo.Connection(
				host=config.get(section, "host"),
				port=config.getint(section, "port")
			)[config.get(section, "database")]
		)
	

