from .data_type import DataType

from .revision import ChangeRevision

class Reverted(DataType):
	
	HISTORY_LIMIT = 5
	
	def __init__(self, revision, history, processed=0, last_id=0):
		self.revision  = revision
		self.history   = history
		self.processed = processed
		self.last_id   = last_id
	
	def __eq__(self, other):
		try:
			return (
				self.revision == other.revision and
				self.history == other.history and
				self.processed == other.processed and
				self.last_id == other.last_id
			)
		except AttributeError:
			return False
	
	def deflate(self):
		return {
			'_id':       self.revision.id,
			'revision':  self.revision.deflate(),
			'history':   self.history,
			'processed': self.processed,
			'last_id':   self.last_id
		}
	
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
	
	@staticmethod
	def inflate(json):
		return Reverted(
			ChangeRevision.inflate(json['revision']),
			json['history'],
			json['processed'],
			json['last_id']
		)
