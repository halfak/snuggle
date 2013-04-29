from .data_type import DataType

class Activity(DataType):
	
	def __init__(self, reverted=0, revisions=None, counts=None):
		self.reverted = int(reverted)
		self.revisions = revisions if revisions != None else {}
		self.counts = counts if revisions != None else {}
	
	def deflate(self):
		return {
			'reverted': self.reverted,
			'revisions': dict(
				(id, revision.deflate()) 
				for id, revision in self.revisions.iteritems()
			),
			'counts': self.counts
		}
	
	@staticmethod
	def inflate(doc):
		return Activity(
			doc['reverted'],
			dict(
				(id, UserRevision.inflate(doc)) 
				for id, doc in doc['revisions'].iteritems()
			),
			doc['counts']
		)
