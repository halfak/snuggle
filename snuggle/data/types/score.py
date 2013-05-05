from .data_type import DataType
from .user import User


class Score(DataType):
	
	def __init__(self, id, user, score=None, attempts=0):
		self.id = int(id)
		self.user = user
		self.score = float(score) if score != None else None
		self.attempts = int(attempts)
	
	def __eq__(self, other):
		try:
			return (
				self.id == other.id and
				self.user == other.user and
				self.score == other.score and
				self.attempts == other.attempts
			)
		except AttributeError:
			return False
	
	def add_attempt(self, inc=1):
		self.attempts += inc
	
	def set(self, score):
		self.score = float(score)
	
	def deflate(self):
		return {
			'_id': self.id,
			'user': self.user.deflate(),
			'score': self.score,
			'attempts': self.attempts
		}
	
	@staticmethod
	def inflate(doc):
		return Score(
			doc['_id'],
			User.inflate(doc['user']),
			doc['score'],
			doc['attempts']
		)
