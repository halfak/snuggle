from snuggle import desirability

class Desirability:
	
	def __init__(self, scores=None):
		scores = scores if scores is not None else {}
		
		self.scores = scores
	
	def add_score(self, score):
		self.scores[score.id] = score.score
	
	def likelihood(self):
		return desirability.likelihood(self.scores.values())
	
	@staticmethod
	def inflate(doc):
		Desirability(doc['scores'])
	
	def deflate(self):
		return {
			'likelihood': self.likelihood(),
			'scores': self.scores
		}
