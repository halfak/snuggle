import pymongo

from .changes import Changes
from .users import Users
from .reverteds import Reverteds
from .talks import Talks

class Mongo:
	
	def __init__(self, db, age, clear):
		self.db          = db
		
		self.changes   = Changes(db)
		self.users     = Users(db, age, clear)
		self.reverteds = Reverteds(db)
		self.talks     = Talks(db)
	
	@staticmethod
	def fromConfig(config, section):
		
		return Mongo(
			pymongo.Connection(
				host=config.get(section, "host"),
				port=config.getint(section, "port")
			)[config.get(section, "database")],
			config.getint(section, "user_age"),
			config.getint(section, "user_clear")
		)
	

