
logger = logging.getLogger("snuggle.system")

class System:
	
	def __init__(self, model, queue, scores):
		self.model = model
		self.queue = queue
		self.scores = scores
	
	def update(self):
		for user_id, rev_id in self.queue.get():
			score = self.scores.get(rev_id)
			
			if score != None:
				user = self.model.users.get(user_id)
				user.score(rev_id, score)
				self.queue.complete(rev_id)
		
		
	
	@staticmethod
	def fromConfig(config):
		
