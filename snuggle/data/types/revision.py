from .data_type import DataType

from byte_diff import ByteDiff
from page import Page
from user import User

class Revision(DataType):
	
	def __init__(self, id, timestamp, comment, diff, sha1):
		self.id        = int(id)
		self.timestamp = int(timestamp)
		self.comment   = unicode(comment)
		self.diff      = diff
		self.sha1      = str(sha1)
	
	def deflate(self):
		return {
			'_id':       self.id,
			'timestamp': self.timestamp,
			'comment':   self.comment,
			'diff':      self.diff.deflate(),
			'sha1':      self.sha1
		}
	
	@staticmethod
	def inflate(doc):
		return Revision(
			doc['_id'],
			doc['timestamp'],
			doc['comment'],
			ByteDiff.inflate(doc['diff']),
			doc['sha1']
		)


class UserRevision(Revision):
	
	def __init__(self, id, page, timestamp, comment, diff, sha1, revert=None):
		Revision.__init__(self, id, timestamp, comment, diff, sha1)
		self.page = page
		self.revert = revert
	
	def deflate(self):
		doc = Revision.deflate(self)
		doc['page'] = self.page.deflate()
		doc['revert'] = self.revert.deflate() if self.revert != None else None
		
		return doc
	
	@staticmethod
	def inflate(doc):
		return UserRevision(
			doc['_id'],
			Page.inflate(doc['page']),
			doc['timestamp'],
			doc['comment'],
			ByteDiff.inflate(doc['diff']),
			doc['sha1'],
			Revert.inflate(doc['revert']) if doc['revert'] != None else None
		)
		

class Revert(Revision):
	
	def __init__(self, id, user, timestamp, comment, diff, sha1):
		Revision.__init__(self, id, timestamp, comment, diff, sha1)
		self.user = user
	
	def deflate(self):
		doc = Revision.deflate(self)
		doc['user'] = self.user.deflate()
		
		return doc
	
	@staticmethod
	def inflate(doc):
		return Revert(
			doc['_id'],
			User.inflate(doc['user']),
			doc['timestamp'],
			doc['comment'],
			doc['diff'],
			doc['sha1']
		)




