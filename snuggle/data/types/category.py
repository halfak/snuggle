import time

from .data_type import DataType
from .user import User

CATEGORIES = set([
	'good faith',
	'ambiguous',
	'bad-faith'
])

class Categorization(DataType):
	
	def __init__(self, snuggler, category, time=None):
		self.snuggler  = snuggler
		self.category  = category; assert category in CATEGORIES
		self.timestamp = int(time) if time != None else time.time()
	
	def deflate(self):
		return {
			'snuggler': self.user.deflate(),
			'category': self.category,
			'timestamp': self.timestamp
		}
	
	@staticmethod
	def inflate(doc):
		return Categorization(
			User.inflate(doc['user']),
			doc['category'],
			doc['timestamp']
		)

class Category(DataType):
	
	def __init__(self, history=None):
		self.history = list(history) if history != None else []
	
	def deflate(self):
		return {
			'category': self.history[-1].category if len(self.history) > 0 else None,
			'history': [c.deflate() for c in history]
		}
	
	@staticmethod
	def inflate(doc):
		return Category([Categorization.inflate(c) for c in doc['history']])
