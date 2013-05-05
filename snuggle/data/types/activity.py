from .data_type import DataType

from .revision import UserRevision

class Activity(DataType):
	
	def __init__(self, reverted=0, self_reverted=0, revisions=None, counts=None):
		self.reverted = int(reverted)
		self.self_reverted = int(self_reverted)
		self.revisions = revisions if revisions != None else {}
		self.counts = counts if revisions != None else {}
	
	def __eq__(self, other):
		try:
			return (
				self.reverted == other.reverted and
				self.self_reverted == other.self_reverted and
				self.revisions == other.revisions and
				self.counts == other.counts
			)
		except AttributeError:
			return False
	
	def deflate(self):
		return {
			'reverted': self.reverted,
			'self_reverted': self.self_reverted,
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
			doc['self_reverted'],
			dict(
				(id, UserRevision.inflate(doc)) 
				for id, doc in doc['revisions'].iteritems()
			),
			doc['counts']
		)
