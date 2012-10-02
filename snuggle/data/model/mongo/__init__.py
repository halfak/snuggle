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
	
	@staticmethod
	def fromConfig(config, section):
		
		return Mongo(
			pymongo.Connection(
				host=config.get(section, "host"),
				port=config.get(section, "port")
			)[config.get(section, "database")
		)
	

