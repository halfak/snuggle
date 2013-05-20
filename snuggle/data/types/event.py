import time

from . import serializable
from .revision import UserRevision
from .user import User, Snuggler
from .user_action import ActionRequest, OperationResult

class Event(serializable.Type):
	TYPE = None
	TYPES = {}
	
	def __init__(self, system_time=None):
		self.system_time = float(system_time) if system_time != None else time.time()
	
	def __eq__(self, other):
		try:
			return (
				serializable.Type.__eq__(self, other) and
				self.TYPE == other.TYPE
			)
		except AttributeError:
			return False
	
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

class ServerStart(Event):
	TYPE = "server start"
	
	SERVERS = set([u'sync', u'web'])
	
	def __init__(self, server, system_time=None):
		Event.__init__(self, system_time)
		self.server = unicode(server); assert server in self.SERVERS
	
Event.TYPES[ServerStart.TYPE] = ServerStart

class ServerStop(Event):
	TYPE = "server stop"
	
	SERVERS = set([u'sync', u'web'])
	
	def __init__(self, server, start_time, stats, error=None, system_time=None):
		Event.__init__(self, system_time)
		self.server = server; assert server in self.SERVERS
		self.start_time = int(start_time)
		self.stats = stats
		self.error = unicode(error) if error != None else None
	
Event.TYPES[ServerStop.TYPE] = ServerStop

class UILoaded(Event):
	TYPE = "ui loaded"
	
	def __init__(self, snuggler=None, data=None, system_time=None):
		Event.__init__(self, system_time)
		self.snuggler = Snuggler.deserialize(snuggler) if snuggler != None else None
		self.data = data
	
UILoaded.TYPES[UILoaded.TYPE] = UILoaded

class UserQuery(Event):
	TYPE = "user query"
	
	def __init__(self, query, wait_time, response_length, 
		         snuggler=None, data=None, system_time=None):
		Event.__init__(self, system_time)
		self.query = query
		self.wait_time = float(wait_time)
		self.response_length = int(response_length)
		self.snuggler = Snuggler.deserialize(snuggler) if snuggler != None else None
		self.data = data
	
UserQuery.TYPES[UserQuery.TYPE] = UserQuery


class ViewUser(Event):
	TYPE = "view user"
	
	def __init__(self, user, snuggler, system_time=None):
		Event.__init__(self, system_time)
		self.user     = User.deserialize(user)
		self.snuggler = Snuggler.deserialize(snuggler)
	
Event.TYPES[ViewUser.TYPE] = ViewUser

class CategorizeUser(Event):
	TYPE = "categorizer user"
	
	def __init__(self, user, snuggler, category, system_time=None):
		Event.__init__(self, system_time)
		self.user     = User.deserialize(user)
		self.snuggler = Snuggler.deserialize(snuggler)
		self.category = unicode(category)
	
Event.TYPES[CategorizeUser.TYPE] = CategorizeUser
	
class UserAction(Event):
	TYPE = "user action"
	
	def __init__(self, request, snuggler, results, system_time=None):
		Event.__init__(self, system_time)
		self.request  = ActionRequest.deserialize(request)
		self.snuggler = Snuggler.deserialize(snuggler)
		self.results  = serializable.List.deserialize(OperationResult, results)
	
Event.TYPES[UserAction.TYPE] = UserAction

	
class SnugglerLogin(Event):
	TYPE = "snuggler login"
	
	def __init__(self, snuggler, system_time=None):
		Event.__init__(self, system_time)
		self.snuggler  = Snuggler.deserialize(snuggler)
Event.TYPES[SnugglerLogin.TYPE] = SnugglerLogin

	
class SnugglerLogout(Event):
	TYPE = "snuggler logout"
	
	def __init__(self, snuggler, system_time=None):
		Event.__init__(self, system_time)
		self.snuggler  = Snuggler.deserialize(snuggler)
	
Event.TYPES[SnugglerLogout.TYPE] = SnugglerLogout

