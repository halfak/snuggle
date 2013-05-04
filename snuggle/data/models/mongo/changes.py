from snuggle.data import types
class Changes: 
	
	def __init__(self, mongo):
		self.mongo = mongo
	
	def insert(self, change):
		self.mongo.db.changes.update(
			{'_id': change.id},
			change.deflate(),
			upsert=True,
			safe=True
		)
	
	def last_id(self):
		docs = list(
			self.mongo.db.changes.find(
				sort=[('_id', -1)], 
				limit=1, 
				fields={'_id': 1}
			)
		)
		if len(docs) > 0:
			return docs[0]['_id']
		else:
			return 0