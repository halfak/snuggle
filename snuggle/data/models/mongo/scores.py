from snuggle.data import types

class Scores: 
	
	def __init__(self, mongo):
		self.mongo = mongo
	
	def insert(self, score):
		return self.mongo.db.scores.update(
			{'_id': score.id},
			score.deflate(), 
			upsert=True,
			safe=True
		)
	
	def get(self, limit=100):
		docs = self.mongo.db.scores.find(
			sort=[('_id', 1)], 
			limit=limit
		)
		for doc in docs:
			yield types.Score.inflate(doc)
	
	def complete(self, score):
		return self.mongo.db.scores.remove(
			score.id,
			safe=True
		)
	
	def update(self, score):
		self.mongo.db.scores.update(
			{'_id': score.id}, 
			score.deflate(), 
			upsert=True, safe=True
		)
	
	def cull(self, min_attempts, id_less_than):
		result = self.mongo.db.scores.remove(
			{
				"_id": {"$lt": id_less_than},
				"attempts": {"$gt": min_attempts}
			},
			safe=True
		)
		return result['n']