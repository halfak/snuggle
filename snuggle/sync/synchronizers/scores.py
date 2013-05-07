import logging, time, traceback

from snuggle.util import import_class
from snuggle.scores import NoScore

from .synchronizer import Synchronizer

logger = logging.getLogger("snuggle.sync.synchronizers.scores")

class Scores(Synchronizer):
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
	
	def run(self):
		# Status
		self.up = True
		self.scores_completed = 0
		self.scores_culled = 0
		self.errored_batches = 0
		self.up_timestamp = time.time()
		
		last_scored_id = 0
		
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
					last_scored_id = score.id
					self.scores_completed += 1
					
				#Cleanup scores.
				culled = self.model.scores.cull(
					self.min_attempts,
					id_less_than=last_scored_id - self.max_id_distance,
					
				)
				self.scores_culled += culled
			except Exception as e:
				logger.error(
					"An error occurred while looking up " + 
					"a revision score: %s" % traceback.format_exc()
				)
				
				self.errored_batches += 1
			
			
			logger.info("%s: %s found, %s missed, %s culled" % (
					len(scores), 
					len(updated_scores), 
					len(scores) - len(updated_scores),
					culled
				)
			)
			
			# Sleep for a bit
			time.sleep(max(self.loop_delay - (time.time() - start), 0))
			
		
		logger.info(
			"Stopped processing scores. " +
			"(last_scored_id=%s, scores_completed=%s)" % (
				last_scored_id, self.scores_completed
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
				score.add_attempt()
				
				# Resave the score
				self.model.scores.update(score)
		
	
	def stop(self):
		logger.info("Stop request recieved.")
		self.stop_requested = True
	
	def status(self):
		if self.up:
			return (
				"Online.\n" + 
				"\tScores completed: %s \n" + 
				"\tScores dropped: %s \n" + 
				"\tErrored batches: %s \n"
				"\tUptime: %s hours."
			) % (
				self.scores_completed, 
				self.scores_dropped, 
				self.errored_batches, 
				round(
					(time.time() - self.up_timestamp) / 
					(60*60.0),
					2
				)
			)
		else:
			return "Offline"
	
	@staticmethod
	def from_config(doc, model):
		ScoresModule = import_class(doc['scores']['module'])
		
		return Scores(
			model,
			ScoresModule.from_config(doc),
			doc['scores_synchronizer']['loop_delay'],
			doc['scores_synchronizer']['scores_per_request'],
			doc['scores_synchronizer']['min_attempts'],
			doc['scores_synchronizer']['max_id_distance']
		)
		