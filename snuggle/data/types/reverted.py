from . import serializable

from .revision import ChangeRevision

class Reverted(serializable.Type):
	
	HISTORY_LIMIT = 5
	
	def __init__(self, revision, history, processed=0, last_id=0):
		self.revision  = ChangeRevision.deserialize(revision)
		self.history   = history; assert history != None
		self.processed = processed
		self.last_id   = last_id
	
	def check(self, revision):
		if revision.id > self.last_id:
			self.last_id = revision.id
			self.processed += 1
			return (
				revision.sha1 in self.history and   # Matching revision in history
				revision.sha1 != self.revision.sha1 # Not reverting back to self
			)
		else:
			return False
	
	def done(self):
		self.processed >= self.HISTORY_LIMIT
