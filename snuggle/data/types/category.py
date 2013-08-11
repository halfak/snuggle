import time

from . import serializable
from .user import Snuggler

CATEGORIES = set([
	'good-faith',
	'ambiguous',
	'bad-faith'
])

class Categorization(serializable.Type):
	
	def __init__(self, snuggler, category, timestamp=None, comment=None):
		self.snuggler  = Snuggler.deserialize(snuggler)
		self.category  = unicode(category); assert category in CATEGORIES
		self.timestamp = float(timestamp) if timestamp != None else time.time()
		self.comment   = unicode(comment) if comment != None else None

class Category(serializable.Type):
	
	def __init__(self, history=None, category=None):
		# Note that category is ignored purposefully.
		if history == None:
			self.history = serializable.List()
		else:
			self.history = serializable.List.deserialize(Categorization, history)
		
		self.category = self.history[-1].category if len(self.history) > 0 else None
	
	
	def serialize(self):
		"""
		Overriding so that we can include category in the deflated version
		"""
		return {
			'category': self.history[-1].category if len(self.history) > 0 else None,
			'history': self.history.serialize()
		}
