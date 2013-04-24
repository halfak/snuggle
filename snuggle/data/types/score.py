from .data_type import DataType
from .user import User


class Score(DataType):
	
	def __init__(self, id, user, score=None):
		self.id = int(id)
		self.user = user
		self.score = float(score) if score != None else None
	
	def deflate(self):
		return {
			'_id': self.id,
			'user': self.user.deflate(),
			'score': self.score
		}
	
	@staticmethod
	def inflate(doc):
		return Score(
			doc['_id'],
			User.inflate(doc['user']),
			doc['score']
		)
