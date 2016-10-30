from snuggle.data import types

from . import util

class Scores: 
	
	def __init__(self, mongo):
		self.mongo = mongo
	
	def insert(self, score):
		return self.mongo.db.scores.update(
			{'_id': score.id},
			util.mongoify(score.serialize()), 
			upsert=True,
			w=1
		)
	
	def get(self, limit=100):
		docs = self.mongo.db.scores.find(
			sort=[('_id', 1)], 
			limit=limit
		)
		for doc in docs:
			yield types.Score.deserialize(util.demongoify(doc))
	
	def complete(self, score):
		doc = self.mongo.db.scores.remove(
			score.id,
			w=1
		)
		return doc['n']
	
	def update(self, score):
		doc = self.mongo.db.scores.update(
			{'_id': score.id}, 
			util.mongoify(score.serialize()), 
			upsert=True, w=1
		)
		doc['n']
	
	def cull(self, min_attempts, max_attempts, id_less_than):
		doc = self.mongo.db.scores.remove(
			{
				"$or": [
					{
						"_id": {"$lt": id_less_than},
						"attempts": {"$gt": min_attempts}
					},
					{
						"attempts": {"$gt": max_attempts}
					}
				]
			},
			w=1
		)
		return doc['n']