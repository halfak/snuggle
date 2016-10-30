from snuggle.data import types

from . import util

class Changes: 
	
	def __init__(self, mongo):
		self.mongo = mongo
	
	def insert(self, change):
		self.mongo.db.changes.update(
			{'_id': change.id},
			util.mongoify(change.serialize()),
			upsert=True,
			w=1
		)
	
	def last(self):
		docs = list(
			self.mongo.db.changes.find(
				sort=[('_id', -1)], 
				limit=1
			)
		)
		if len(docs) > 0:
			return types.Change.deserialize(util.demongoify(docs[0]))
		else:
			return None