from snuggle.data import types

class Scores: 
	
	def __init__(self, db):
		self.db = db
	
	def new(self, score):
		self.db.scores.insert(score.deflate(), safe=True)
	
	def get(self, limit=100):
		docs = self.db.scores.find(
			sort=[('_id', 1)], 
			limit=limit
		)
		for doc in docs:
			yield types.Score.inflate(doc)
	
	def complete(self, score):
		self.db.scores.remove(
			score.id,
			safe=True
		)
	
	def update(self, score):
		self.db.scores.update(
			{'_id': score.id}, 
			score.deflate(), 
			upsert=True, safe=True
		)
	
	def cull(self, min_attempts, id_less_than):
		result = self.db.scores.remove(
			{
				"_id": {"$lt": id_less_than},
				"attempts": {"$gt": self.MINIMUM_ATTEMPTS}
			},
			safe=True
		)
		return result['n']