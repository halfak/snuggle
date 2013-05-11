from pymongo.errors import DuplicateKeyError

from snuggle.data import types

class Reverteds:
	
	def __init__(self, mongo):
		self.mongo = mongo
	
	def __contains__(self, page_id):
		return self.mongo.db.reverteds.find_one({'revision.page._id': page_id}) != None
	
	def insert(self, reverted):
		try:
			self.mongo.db.reverteds.insert(
				reverted.deflate(),
				safe=True
			)
			return 1
		except DuplicateKeyError:
			return 0
	
	def update(self, reverted):
		doc = self.mongo.db.reverteds.update(
			{'_id': reverted.revision.id}, 
			reverted.deflate(), 
			upsert=True, 
			safe=True
		)
		return doc['n']
	
	def remove(self, reverted):
		doc = self.mongo.db.reverteds.remove(
			{'_id': reverted.revision.id},
			safe=True
		)
		return doc['n'] > 0
	
	def get(self, id, inflate=True):
		doc = self.mongo.db.reverteds.find_one({'_id': id})
		if doc != None:
			if inflate:
				return types.Reverted.inflate(doc)
			else:
				return doc
		else:
			raise KeyError(id)
	
	def find(self, page_id):
		for doc in self.mongo.db.reverteds.find({'revision.page._id': page_id}):
			yield types.Reverted.inflate(doc)