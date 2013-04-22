from .data_type import DataType

class Reverted(DataType):
	
	def __init__(self, revision, history=None, processed=0):
		self.revision  = revision
		self.history   = history if history != None else {}
		self.processed = processed
	
	def deflate(self):
		return {
			'_id':       self.revision.id,
			'revision':  self.revision.deflate(),
			'history':   self.history,
			'processed': self.processed
		}
	
	@staticmethod
	def inflate(json):
		return Reverted(
			Revision.inflate(json['revision']),
			json['history'],
			json['processed']
		)
