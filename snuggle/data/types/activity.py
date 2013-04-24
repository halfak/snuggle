class Activity(DataType):
	
	def __init__(self, reverted=0, revisions=None, counts=None):
		self.reverted = int(reverted)
		self.revisions = revisions
		self.counts = counts
	
	def deflate(self):
		return {
			'reverted': self.reverted,
			'revisions': dict(
				(id, revision.deflate()) 
				for id, revision in self.revisions.iteritems()
			),
			'counts': counts
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
