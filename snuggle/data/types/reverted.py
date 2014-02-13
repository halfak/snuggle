from . import serializable

from .revision import ChangeRevision

# TODO: Why not just track page state?
# - One reason is that tracking page state in order to identify who was reverted
#   would require storing HISTORY_LIMIT revisions inside the object rather than
#   just the one.  It seems like that would be better though.

class Reverted(serializable.Type):
	
	HISTORY_LIMIT = 5
	
	def __init__(self, revision, history, processed=0, last_id=0, id=None):
		self.revision  = ChangeRevision.deserialize(revision)
		self.id        = self.revision.id
		self.history   = history; assert history != None # WTF.  Is this a dict or what?
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
		return self.processed >= self.HISTORY_LIMIT
