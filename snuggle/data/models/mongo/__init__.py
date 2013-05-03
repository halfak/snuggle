import pymongo

from .updater import Updater
from .changes import Changes
from .users import Users
from .reverteds import Reverteds
from .scores import Scores

class Mongo:
	
	def __init__(self, db):
		self.db          = db
		
		self.update    = Updater(self)
		
		self.changes   = Changes(self)
		self.events    = Events(self)
		self.reverteds = Reverteds(self)
		self.scores    = Scores(self)
		self.users     = Users(self)
	
	
	def cull(self, older_than):
		deaths = [json['_id'] for json in self.db.users.find({'registration': {"$lt": older_than}})]
		
		self.db.users.remove({'_id': {"$in": deaths}})
		self.db.reverteds.remove({'revision.user._id': {'$in': deaths}})
		self.db.changes.remove({'timestamp': {"$lt": older_than}})
		self.db.scores.remove({'user_id': {'$in': deaths}}) #TODO check
	
	@staticmethod
	def from_config(doc):
		
		return Mongo(
			pymongo.Connection(
				host=doc['model']['host'],
				port=doc['model']['port']
			)[doc['model']['database']]
		)
	
