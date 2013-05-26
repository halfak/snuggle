from . import serializable
from .user import User


class ActionRequest(serializable.Type):
	
	def __init__(self, action_name, user, fields, watch=False):
		self.action_name = action_name
		self.user        = User.deserialize(user)
		self.fields      = fields
		self.watch       = bool(watch)


class OperationResult(serializable.Type):
	TYPES = {}
	
	def serialize(self):
		doc = serializable.Type.serialize(self)
		doc['type'] = self.TYPE
		return doc
	
	@classmethod
	def deserialize(cls, doc_or_instance):
		if isinstance(doc_or_instance, cls):
			return doc_or_instance
		else:
			Class = cls.TYPES[doc_or_instance['type']]
			del doc_or_instance['type']
			return Class(**doc_or_instance)
		
	
class EditPreview(OperationResult):
	TYPE = "edit"
	
	def __init__(self, page_name, html, comment):
		self.page_name = unicode(page_name)
		self.html      = unicode(html)
		self.comment   = unicode(comment)
	

class ReplacePreview(EditPreview):
	TYPE = "replace"
OperationResult.TYPES[ReplacePreview.TYPE] = ReplacePreview

class AppendPreview(EditPreview):
	TYPE = "append"
OperationResult.TYPES[AppendPreview.TYPE] = AppendPreview

class EditResult(OperationResult):
	TYPE = "edit result"
	
	def __init__(self, rev_id, page_name):
		self.rev_id = int(rev_id)
		self.page_name = unicode(page_name)
	
OperationResult.TYPES[EditResult.TYPE] = EditResult
	
class WatchPreview(OperationResult):
	TYPE = "watch"
	
	def __init__(self, page_name):
		self.page_name = unicode(page_name)
	
OperationResult.TYPES[WatchPreview.TYPE] = WatchPreview
	
class WatchResult(OperationResult):
	TYPE = "watch result"
	
	def __init__(self, page_name):
		self.page_name = unicode(page_name)
	
OperationResult.TYPES[WatchResult.TYPE] = WatchResult
	
