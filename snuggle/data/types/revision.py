from .data_type import DataType

from byte_diff import ByteDiff
from page import Page
from user import User

class Revision(DataType):
	
	def __init__(self, id, user, page, timestamp, comment, diff, sha1, revert=None):
		self.id        = int(id)
		self.user      = user
		self.page      = page
		self.timestamp = int(timestamp)
		self.comment   = unicode(comment)
		self.diff      = diff
		self.sha1      = sha1
		self.revert    = revert
	
	def deflate(self):
		return {
			'_id':       self.id,
			'user':      self.user.deflate(),
			'page':      self.page.deflate(),
			'timestamp': self.timestamp,
			'comment':   self.comment,
			'diff':      self.diff.deflate(),
			'revert':    self.revert.deflate(),
			'sha1':      self.sha1
		}
	
	@staticmethod
	def inflate(json):
		return Revision(
			json['_id'],
			User.inflate(json['user']),
			Page.inflate(json['page']),
			json['timestamp'],
			json['comment'],
			ByteDiff.inflate(json['diff']),
			json['sha1'],
			Revision.inflate(json['revert']) if json['revert'] != None else None
		)
