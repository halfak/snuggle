from . import serializable

from .byte_diff import ByteDiff
from .page import Page
from .user import User

class Revision(serializable.Type):
	
	def __init__(self, id, timestamp, comment, diff, sha1):
		self.id        = int(id)
		self.timestamp = int(timestamp)
		self.comment   = unicode(comment)
		self.diff      = ByteDiff.deserialize(diff)
		self.sha1      = str(sha1)
	
	@staticmethod
	def convert(revision):
		return Revision(
			revision.id,
			revision.timestamp,
			revision.comment,
			revision.diff,
			revision.sha1
		)
class ChangeRevision(Revision):
	
	def __init__(self, id, user, page, timestamp, comment, diff, sha1):
		Revision.__init__(self, id, timestamp, comment, diff, sha1)
		self.user = User.deserialize(user)
		self.page = Page.deserialize(page)


class UserRevision(Revision):
	
	def __init__(self, id, page, timestamp, comment, diff, sha1, revert=None):
		Revision.__init__(self, id, timestamp, comment, diff, sha1)
		self.page = Page.deserialize(page)
		self.revert = Revert.deserialize(revert) if revert != None else None
	
	@staticmethod
	def convert(revision):
		return UserRevision(
			revision.id,
			revision.page,
			revision.timestamp,
			revision.comment,
			revision.diff,
			revision.sha1,
			revision.revert if hasattr(revision, "revert") else None
		)

class Revert(Revision):
	
	def __init__(self, id, user, timestamp, comment, diff, sha1):
		Revision.__init__(self, id, timestamp, comment, diff, sha1)
		self.user = User.deserialize(user)
	
	@staticmethod
	def convert(revision):
		return Revert(
			revision.id,
			revision.user,
			revision.timestamp,
			revision.comment,
			revision.diff,
			revision.sha1
		)




