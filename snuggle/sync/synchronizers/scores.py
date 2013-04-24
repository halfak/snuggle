import logging

from snuggle import stiki
from .synchronizer import Synchronizer

logger = logging.getLogger("snuggle.sync.synchronizers.scores")

class Scores(Synchronizer):
	"""
	Synchronizes vandal scores for users' main namespace edits.  This 
	synchronizer is used to keep the "desirability" score up to date for a 
	user.
	"""
	def __init__(self, model, stiki_api, 
		loop_delay, scores_per_request, max_id_distance):
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
		self.model = model
		self.source = source
		
		# Behavior
		self.loop_delay = loop_delay
		self.scores_per_batch = scores_per_batch
		self.max_id_distance  = max_id_distance
		
		# Status
		self.up = False
		self.stop_requested = False
	
	def run(self):
		# Status
		self.up = True
		self.scores_completed = 0
		self.scores_dropped = 0
		self.errored_batches = 0
		self.up_timestamp = time.time()
		
		last_scored_id = 0
		
		while not self.stop_requested:
			
			start = time.time()
			
			# Get scores from model
			scores = self.model.scores.get(self.scores_per_request)
			
			try:
				# Lookup scores
				updated_scores = self.__lookup_scores(scores)
				for score in updated_scores:
					# Update user
					user = self.model.users.get(score.user.id)
					user.score(score)
					
					# Clear the score
					self.model.scores.complete(score)
					
					# Record this ID
					last_scored_id = score.id
					self.scores_completed += 1
					
				#Cleanup scores.
				dropped_scores = self.model.scores.clean(
					id_less_than=last_scored_id - max_id_distance
				)
				for score in dropped_scores:
					self.scores_dropped += 1
			except Exception as e:
				logger.error(
					"An error occurred while looking up " + 
					"a revision score: %s" % traceback.format_exc()
				)
				
				self.errored_batches += 1
			
			# Sleep for a bit
			time.sleep(self.loop_delay - (time.time() - start))
			
		
		logger.info(
			"Stopped processing scores. " +
			"(last_scored_id=%s, scores_completed=%s, )" % (
				last_scored_id, last_timestamp
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
				value = self.source.scores.lookup(score.id)
				score.set(value)
				
			except stiki.NoScore as e:
				# Note the attempt
				score.add_attempt()
				
				# Resave the score
				self.model.scores.update(score)
				
			finally:
				yield score
		
	
	def stop(self):
		logging.info("Stop request recieved.")
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
	def fromConfig(doc, section):
		model_section = doc[section]['model']
		model = import_class(doc[model_section]['module'])
		
		source_section = doc[section]['source']
		source = import_class(doc[source_section]['module'])
		
		return Scores(
			model.fromConfig(doc, model_section),
			stiki.API.fromConfig(doc, "stiki"),
			config.getint("system", "loop_delay"),
			config.getint("system", "scores_per_request"),
			config.getint("system", "max_id_distance")
		)
		
