from pymongo.errors import DuplicateKeyError

from snuggle.data import types

from . import util

class Reverteds:
	
	def __init__(self, mongo):
		self.mongo = mongo
	
	def __contains__(self, page_id):
		return self.mongo.db.reverteds.find_one({'revision.page.id': page_id}) != None
	
	def insert(self, reverted):
		
		try:
			self.mongo.db.reverteds.insert(
				util.mongoify(reverted.serialize()),
				w=1
			)
			return 1
		except DuplicateKeyError:
			return 0
	
	def update(self, reverted):

		doc = self.mongo.db.reverteds.update(
			{'_id': reverted.revision.id}, 
			util.mongoify(reverted.serialize()), 
			upsert=True, 
			w=1
		)
		return doc['n']
	
	def remove(self, reverted):
		doc = self.mongo.db.reverteds.remove(
			{'_id': reverted.id},
			w=1
		)
		return doc['n'] > 0
	
	def get(self, id, inflate=True):
		doc = self.mongo.db.reverteds.find_one({'_id': id})
		if doc != None:
			if inflate:
				return types.Reverted.deserialize(util.demongoify(doc))
			else:
				return util.demongoify(doc)
		else:
			raise KeyError(id)
	
	def find(self, page_id):
		for doc in self.mongo.db.reverteds.find({'revision.page.id': page_id}):
			yield types.Reverted.deserialize(util.demongoify(doc))
