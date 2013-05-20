import logging, time, traceback

from snuggle.util import import_class
from snuggle.scores import NoScore

from .synchronizer import Synchronizer

logger = logging.getLogger("snuggle.sync.synchronizers.scores")

class Scores(Synchronizer):
	NAME = "scores"
	
	"""
	Synchronizes vandal scores for users' main namespace edits.  This 
	synchronizer is used to keep the "desirability" score up to date for a 
	user.
	"""
	def __init__(self, model, scores, 
		loop_delay, scores_per_request, min_attempts, max_id_distance):
		"""
		:Parameters:
			model: `snuggle.data.models.Model`
			source: `snuggle.data.models.Source`
			loop_delay: int
			scores_per_request: int
			max_id_distance: int
		"""
		Synchronizer.__init__(self)
		
		# Resources
		self.model  = model
		self.scores = scores
		
		# Behavior
		self.loop_delay         = float(loop_delay)
		self.scores_per_request = int(scores_per_request)
		self.min_attempts       = int(min_attempts)
		self.max_id_distance    = int(max_id_distance)
		
		# Status
		self.up = False
		self.stop_requested = False
		self.up_timestamp = None
		self.scores_completed = 0
		self.scores_culled = 0
		self.errored_batches = 0
		self.last_scored_id = 0
	
	def run(self):
		# Status
		self.up = True
		
		
		while not self.stop_requested:
			
			start = time.time()
			
			# Get scores from model
			scores = list(self.model.scores.get(self.scores_per_request))
			
			try:
				# Lookup scores
				updated_scores = list(self.__lookup_scores(scores))
				for score in updated_scores:
					
					logger.debug(
						"Found score for %s by %s: %s" % (
							score.id, score.user.name, score.score
						)
					)
					
					# Update user
					user = self.model.users.add_score(score)
					
					# Clear the score
					self.model.scores.complete(score)
					
					# Record this ID
					self.last_scored_id = score.id
					self.scores_completed += 1
					
				#Cleanup scores.
				culled = self.model.scores.cull(
					self.min_attempts,
					id_less_than=self.last_scored_id - self.max_id_distance,
					
				)
				self.scores_culled += culled
				
				logger.info("%s: %s found, %s missed, %s culled" % (
						len(scores), 
						len(updated_scores), 
						len(scores) - len(updated_scores),
						culled
					)
				)
			except Exception as e:
				logger.error(
					"An error occurred while looking up " + 
					"a revision score: %s" % traceback.format_exc()
				)
				
				self.errored_batches += 1
			
			
			
			# Sleep for a bit
			time.sleep(max(self.loop_delay - (time.time() - start), 0))
			
		
		logger.info(
			"Stopped processing scores. " +
			"(last_scored_id=%s, scores_completed=%s)" % (
				self.last_scored_id, self.scores_completed
			)
		)
		self.up = False
	
	def __lookup_scores(self, scores):
		"""
		Looks up the scores using the data source.  Yields scores
		that were successfully looked up.  Also increments the attempts
		for scores that could not be looked up.
		"""
		for score in scores:
			try:
				# Get score
				value = self.scores.lookup(score.id)
				score.set(value)
				
				yield score
				
			except NoScore as e:
				# Note the attempt
				#
				# TODO: This is slow and goes crazy when dealing with STiki downtime. 
				score.add_attempt()
				
				# Resave the score
				self.model.scores.update(score)
		
	
	def stop(self):
		logger.info("Stop request recieved.")
		self.stop_requested = True
		
	def status(self):
		return {
			'scores completed': self.scores_completed,
			'scores dropped': self.scores_culled,
			'errored batches': self.errored_batches
		}
	
	@staticmethod
	def from_config(config, model):
		ScoresModule = import_class(config.snuggle['scores']['module'])
		
		return Scores(
			model,
			ScoresModule.from_config(config),
			config.snuggle['scores_synchronizer']['loop_delay'],
			config.snuggle['scores_synchronizer']['scores_per_request'],
			config.snuggle['scores_synchronizer']['min_attempts'],
			config.snuggle['scores_synchronizer']['max_id_distance']
		)
		
