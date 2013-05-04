from .data_type import DataType

from snuggle.util import desirability

class Desirability:
	
	def __init__(self, scores=None):
		scores = scores if scores is not None else {}
		
		self.scores = scores
	
	def __eq__(self, other):
		try:
			return self.scores == other.scores
		except AttributeError:
			return False
	
	def deflate(self):
		return {
			'likelihood': self.likelihood(),
			'scores': self.scores
		}
	
	def add_score(self, score):
		self.scores[str(score.id)] = score.score
	
	def likelihood(self):
		return desirability.likelihood(self.scores.values())
	
	@staticmethod
	def inflate(doc):
		return Desirability(doc['scores'])
	
