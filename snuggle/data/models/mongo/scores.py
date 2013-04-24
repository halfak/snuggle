from data import types

class Scores: 
	
	def __init__(self, db):
		self.db = db
	
	def insert(self, score):
		self.db.scores.insert(score.deflate())
	
	def get(self, limit=100):
		docs = self.db.scores.find(
			sort=[('_id', -1)], 
			limit=limit
		)
		for doc in docs:
			types.Score.inflate(doc)
	
	def complete(self, score):
		self.db.scores.remove(score.id)
	
	def clean(self, id_less_than):
		self.db.scores.remove(
			{"_id": {"$lt": id_less_than}}
		)
