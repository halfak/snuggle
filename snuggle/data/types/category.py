import time

from . import serializable
from .user import Snuggler

CATEGORIES = set([
	'good-faith',
	'ambiguous',
	'bad-faith'
])

class Categorization(serializable.Type):
	
	def __init__(self, snuggler, category, timestamp=None):
		self.snuggler  = Snuggler.deserialize(snuggler)
		self.category  = unicode(category); assert category in CATEGORIES
		self.timestamp = float(timestamp) if timestamp != None else time.time()

class Category(serializable.Type):
	
	def __init__(self, history=None):
		if history == None:
			self.history = serializable.List()
		else:
			self.history = serializable.List.deserialize(Categorization, history)
