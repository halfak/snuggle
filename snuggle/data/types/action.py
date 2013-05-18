from . import serializable
from .user import User

class UserActions:
	
	def __init__(self, actors):
		self.actors = actors
	
	def get(name):
		return self.actors[name]
	
	@staticmethod
	def from_config(config, api):
		
		actors = {}
		for doc in config['user_actions']:
			actor = Actor.from_config(config, doc, api)
			actions[action.name] = action
		
		return UserActions(actions)


class Actor(object):
	
	ACTIONS = {}
	
	def __init__(self, name, wiki_ops):
		self.name = name
		self.wiki_ops = wiki_ops
		
	def preview(self, request, snuggler):
		return [op.preview(request, snuggler) for op in self.wiki_ops]
	
	def perform(self, request, snuggler):
		return [op.perform(request, snuggler) for op in self.wiki_ops]
	
	@classmethod
	def register(cls, user_action):
		cls.ACTIONS[user_action.name] = user_action
	
	@classmethod
	def get(cls, name):
		return cls.ACTIONS[name]
	
	@classmethod
	def from_config(config, doc, api):
		return Actor(
			doc['name'],
			[api.op(op_doc) for op_doc in doc['wiki_ops']]
		)
	

class ActionRequest(serializable.Type):
	
	def __init__(self, name, fields, user):
		self.name     = unicode(name)
		self.fields   = fields
		self.user     = User.deserialize(user)
	
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
	TYPE = "edit preview"
	
	def __init__(self, page_name, html, comment):
		self.page_name = unicode(page_name)
		self.html      = unicode(html)
		self.comment   = unicode(comment)
	
OperationResult.TYPES[EditPreview.TYPE] = EditPreview

class EditResult(OperationResult):
	TYPE = "edit result"
	
	def __init__(self, rev_id, page_name):
		self.rev_id = int(rev_id)
		self.page_name = unicode(page_name)
	
OperationResult.TYPES[EditResult.TYPE] = EditResult
	
class WatchPreview(OperationResult):
	TYPE = "watch preview"
	
	def __init__(self, page_name):
		self.page_name = unicode(page_name)
	
OperationResult.TYPES[WatchPreview.TYPE] = WatchPreview
	
class WatchResult(OperationResult):
	TYPE = "watch result"
	
	def __init__(self, page_name):
		self.page_name = unicode(page_name)
	
OperationResult.TYPES[WatchResult.TYPE] = WatchResult
	
