from collections import namedtuple
import time

from . import serializable
from .revision import UserRevision
from .user import User, Snuggler
from .user_action import ActionRequest, OperationResult

class EventType(serializable.Type):
	
	def __init__(self, entity, action):
		self.entity = entity
		self.action = action
	
	def __hash__(self):
		return hash((self.entity, self.action))

class Event(serializable.Type):
	TYPE = EventType("server", "started")
	
	TYPES = {}
	PUBLIC_TYPES = set()
	
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
		doc['type'] = self.TYPE.serialize()
			
		return doc
	
	@classmethod
	def deserialize(cls, doc_or_instance):
		if isinstance(doc_or_instance, cls):
			return doc_or_instance
		else:
			type = EventType.deserialize(doc_or_instance['type'])
			Class = cls.TYPES[type]
			del doc_or_instance['type']
			return Class(**doc_or_instance)
	
	@classmethod
	def register(cls, sub_class):
		assert isinstance(sub_class, cls)
		cls.TYPES[sub_class.TYPE] = sub_class
		if sub_class.PUBLIC:
			cls.PUBLIC_TYPES.add(sub_class.TYPE)
		
	
class ServerStarted(Event):
	TYPE = EventType("server", "start")
	PUBLIC = True
	
	SERVERS = set([u'sync', u'web'])
	
	def __init__(self, server, system_time=None):
		Event.__init__(self, system_time)
		self.server = unicode(server); assert server in self.SERVERS
	
Event.TYPES[ServerStarted.TYPE] = ServerStarted

class ServerStopped(Event):
	TYPE = EventType("server", "stopped")
	PUBLIC = True
	
	SERVERS = set([u'sync', u'web'])
	
	def __init__(self, server, start_time, stats, error=None, system_time=None):
		Event.__init__(self, system_time)
		self.server = server; assert server in self.SERVERS
		self.start_time = int(start_time)
		self.stats = stats
		self.error = unicode(error) if error != None else None
	
Event.TYPES[ServerStopped.TYPE] = ServerStopped

class UILoaded(Event):
	TYPE = EventType("ui", "loaded")
	
	def __init__(self, snuggler=None, data=None, system_time=None):
		Event.__init__(self, system_time)
		self.snuggler = Snuggler.deserialize(snuggler) if snuggler != None else None
		self.data = data
	
Event.TYPES[UILoaded.TYPE] = UILoaded

class UsersQueried(Event):
	TYPE = EventType("users", "queried")
	
	def __init__(self, filters, wait_time, response_length, 
		         snuggler=None, data=None, system_time=None):
		Event.__init__(self, system_time)
		self.filters = filters
		self.wait_time = float(wait_time)
		self.response_length = int(response_length)
		self.snuggler = Snuggler.deserialize(snuggler) if snuggler != None else None
		self.data = data
	
Event.TYPES[UsersQueried.TYPE] = UsersQueried

class EventsQueried(Event):
	TYPE = EventType("events", "queried")
	
	def __init__(self, filters, wait_time, response_length, 
		         snuggler=None, data=None, system_time=None):
		Event.__init__(self, system_time)
		self.filters = filters
		self.wait_time = float(wait_time)
		self.response_length = int(response_length)
		self.snuggler = Snuggler.deserialize(snuggler) if snuggler != None else None
		self.data = data
	
Event.TYPES[EventsQueried.TYPE] = EventsQueried


class UserViewed(Event):
	TYPE = EventType("user", "viewed")
	
	def __init__(self, user, snuggler, system_time=None):
		Event.__init__(self, system_time)
		self.user     = User.deserialize(user)
		self.snuggler = Snuggler.deserialize(snuggler)
	
Event.TYPES[UserViewed.TYPE] = UserViewed

class UserCategorized(Event):
	TYPE = EventType("user", "categorized")
	PUBLIC = True
	
	def __init__(self, user, snuggler, category, system_time=None):
		Event.__init__(self, system_time)
		self.user     = User.deserialize(user)
		self.snuggler = Snuggler.deserialize(snuggler)
		self.category = unicode(category)
	
Event.TYPES[UserCategorized.TYPE] = UserCategorized
	
class UserActioned(Event):
	TYPE = EventType("user", "actioned")
	PUBLIC = True
	
	def __init__(self, request, snuggler, results, system_time=None):
		Event.__init__(self, system_time)
		self.request  = ActionRequest.deserialize(request)
		self.snuggler = Snuggler.deserialize(snuggler)
		self.results  = serializable.List.deserialize(OperationResult, results)
	
	def serialize(self):
		doc = Event.serialize(self)
		# Don't include results that are not considered "public"
		doc['results'] = [r.serialize() for r in self.results if r.PUBLIC]
		
		return doc
	
Event.TYPES[UserActioned.TYPE] = UserActioned

class SnugglerLoggedIn(Event):
	TYPE = EventType("snuggler", "logged in")
	
	def __init__(self, snuggler, system_time=None):
		Event.__init__(self, system_time)
		self.snuggler  = Snuggler.deserialize(snuggler)
Event.TYPES[SnugglerLoggedIn.TYPE] = SnugglerLoggedIn

	
class SnugglerLoggedOut(Event):
	TYPE = EventType("snuggler", "logged out")
	
	def __init__(self, snuggler, system_time=None):
		Event.__init__(self, system_time)
		self.snuggler  = Snuggler.deserialize(snuggler)
	
Event.TYPES[SnugglerLoggedOut.TYPE] = SnugglerLoggedOut

