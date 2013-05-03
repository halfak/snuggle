from .data_type import DataType

from .revision import 

class Reverted(DataType):
	
	HISTORY_LIMIT = 5
	
	def __init__(self, revision, history=None, processed=0, last_processed_id=0):
		self.revision  = revision
		self.history   = history if history != None else {}
		self.processed = processed
		self.last_id   = 0
	
	def check(self, revision):
		if revision.id > self.last_processed_id:
			self.last_processed_id
			self.processed += 1
			return (
				revision.sha1 in self.history and   # Matching revision in history
				revision.sha1 != self.revision.sha1 # Not reverting back to self
			)
	
	def done(self):
		self.processed >= self.HISTORY_LIMIT
	
	def deflate(self):
		return {
			'_id':       self.revision.id,
			'revision':  self.revision.deflate(),
			'history':   self.history,
			'processed': self.processed,
			'last_id':   self.last_id
		}
	
	@staticmethod
	def inflate(json):
		return Reverted(
			types.ChangeRevision.inflate(json['revision']),
			json['history'],
			json['processed'],
			json['last_id']
		)
