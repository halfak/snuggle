import time

from .data_type import DataType
from .user import User

CATEGORIES = set([
	'good-faith',
	'ambiguous',
	'bad-faith'
])

class Categorization(DataType):
	
	def __init__(self, snuggler, category, timestamp=None):
		self.snuggler  = snuggler
		self.category  = unicode(category); assert category in CATEGORIES
		self.timestamp = float(timestamp) if timestamp != None else time.time()
	
	def __eq__(self, other):
		try:
			return (
				self.snuggler == other.snuggler and
				self.category == other.category and
				self.timestamp == other.timestamp
			)
		except AttributeError:
			return False
	
	def deflate(self):
		return {
			'snuggler': self.snuggler.deflate(),
			'category': self.category,
			'timestamp': self.timestamp
		}
	
	@staticmethod
	def inflate(doc):
		return Categorization(
			User.inflate(doc['snuggler']),
			doc['category'],
			doc['timestamp']
		)

class Category(DataType):
	
	def __init__(self, history=None):
		self.history = list(history) if history != None else []
	
	def __eq__(self, other):
		try:
			return self.history == other.history
		except AttributeError:
			return False
	
	def deflate(self):
		return {
			'category': self.history[-1].category if len(self.history) > 0 else None,
			'history': [c.deflate() for c in self.history]
		}
	
	@staticmethod
	def inflate(doc):
		return Category([Categorization.inflate(c) for c in doc['history']])
