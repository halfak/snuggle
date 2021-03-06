import sys
from snuggle.util import desirability

from . import serializable

class Desirability(serializable.Type):
	
	def __init__(self, scores=None, ratio=None, likelihood=None):
		# Note that likelihood is ignored purposefully.
		scores = scores if scores is not None else {}
		
		self.scores = scores
	
	def serialize(self):
		"""
		Overriding so that we can include likelihood in the deflated version
		"""
		return {
			'likelihood': self.likelihood(),
			'ratio': self.ratio(),
			'scores': self.scores
		}
	
	def add_score(self, score):
		self.scores[str(score.id)] = score.score
	
	def likelihood(self):
		return desirability.likelihood(self.scores.values())
	
	def ratio(self):
		return min(sys.maxint, desirability.ratio(self.scores.values()))
	
