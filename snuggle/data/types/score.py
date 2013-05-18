from . import serializable
from .user import User

class Score(serializable.Type):
	
	def __init__(self, id, user, score=None, attempts=0):
		self.id = int(id)
		self.user = User.deserialize(user)
		self.score = float(score) if score != None else None
		self.attempts = int(attempts)
	
	def add_attempt(self, inc=1):
		self.attempts += inc
	
	def set(self, score):
		self.score = float(score)
