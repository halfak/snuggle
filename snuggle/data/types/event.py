import time

from .action import Action
from .data_type import DataType
from .revision import UserRevision
from .user import User

class Event(DataType):
	TYPES = {}
	
	def __init__(self, type, system_time=None):
		self.type = unicode(type)
		self.system_time = float(system_time) if system_time != None else time.time()
	
	def __eq__(self, other):
		return (
			self.type == other.type and
			self.system_time == other.system_time
		)
	
	def deflate(self):
		return {
			'type': self.type,
			'system_time': self.system_time
		}
		
	@staticmethod
	def inflate(doc):
		EventClass = Event.TYPES[doc['type']]
		return EventClass.inflate(doc)


class ServerStart(Event):
	TYPE = "server start"
	
	SERVERS = set(['sync', 'web'])
	
	def __init__(self, server, system_time=None):
		Event.__init__(self, self.TYPE, system_time)
		self.server = server; assert server in self.SERVERS
	
	def __eq__(self, other):
		try:
			return (
				Event.__eq__(self, other) and
				self.server == other.server
			)
		except AttributeError:
			return False
	
	def deflate(self):
		doc = Event.deflate(self)
		doc['server'] = self.server
		return doc
	
	@staticmethod
	def inflate(doc):
		return ServerStart(
			doc['server'],
			doc['system_time']
		)
Event.TYPES[ServerStart.TYPE] = ServerStart

class ServerStop(Event):
	TYPE = "server stop"
	
	SERVERS = set(['sync', 'web'])
	
	def __init__(self, server, start_time, stats, error=None, system_time=None):
		Event.__init__(self, self.TYPE, system_time)
		self.server = server; assert server in self.SERVERS
		self.start_time = int(start_time)
		self.stats = stats
		self.error = unicode(error) if error != None else None
	
	def __eq__(self, other):
		try:
			return (
				Event.__eq__(self, other) and
				self.server == other.server
			)
		except AttributeError:
			return False
	
	def deflate(self):
		doc = Event.deflate(self)
		doc['server'] = self.server
		doc['start_time'] = self.start_time
		doc['stats'] = self.stats
		doc['error'] = self.error
		return doc
	
	@staticmethod
	def inflate(doc):
		return ServerStop(
			doc['server'],
			doc['start_time'],
			doc['stats'],
			doc['error'],
			doc['system_time']
		)
Event.TYPES[ServerStop.TYPE] = ServerStop

class ViewUser(Event):
	TYPE = "view user"
	
	def __init__(self, user, snuggler, system_time=None):
		Event.__init__(self, self.TYPE, system_time)
		self.user     = user
		self.snuggler = snuggler
	
	def __eq__(self, other):
		try:
			return (
				Event.__eq__(self, other) and
				self.user == other.user and
				self.snuggler == other.snuggler 
			)
		except AttributeError:
			return False
	
	def deflate(self):
		doc = Event.deflate(self)
		doc['user']     = self.user.deflate()
		doc['snuggler'] = self.snuggler.deflate()
		return doc
	
	@staticmethod
	def inflate(doc):
		return ViewUser(
			User.inflate(doc['user']),
			User.inflate(doc['snuggler']),
			doc['system_time']
		)
Event.TYPES[ViewUser.TYPE] = ViewUser

class WatchUser(Event):
	TYPE = "watch user"
	
	def __init__(self, user, snuggler, system_time=None):
		Event.__init__(self, self.TYPE, system_time)
		self.user     = user
		self.snuggler = snuggler
	
	def __eq__(self, other):
		try:
			return (
				Event.__eq__(self, other) and
				self.user == other.user and
				self.snuggler == other.snuggler 
			)
		except AttributeError:
			return False
	
	def deflate(self):
		doc = Event.deflate(self)
		doc['user']     = self.user.deflate()
		doc['snuggler'] = self.snuggler.deflate()
		return doc
	
	@staticmethod
	def inflate(doc):
		return WatchUser(
			User.inflate(doc['user']),
			User.inflate(doc['snuggler']),
			doc['system_time']
		)
Event.TYPES[WatchUser.TYPE] = WatchUser

class CategorizeUser(Event):
	TYPE = "categorizer user"
	
	def __init__(self, user, snuggler, category, system_time=None):
		Event.__init__(self, self.TYPE, system_time)
		self.user  = user
		self.snuggler = snuggler
		self.category = category
	
	def __eq__(self, other):
		return (
			Event.__eq__(self, other) and
			self.user == other.user and
			self.snuggler == other.snuggler and
			self.category == other.category
		)
	
	def deflate(self):
		doc = Event.deflate(self)
		doc['user']     = self.user.deflate()
		doc['snuggler'] = self.snuggler.deflate()
		doc['category'] = self.category
		return doc
	
	@staticmethod
	def inflate(doc):
		return CategorizeUser(
			User.inflate(doc['user']),
			User.inflate(doc['snuggler']),
			doc['category'],
			doc['system_time']
		)
Event.TYPES[CategorizeUser.TYPE] = CategorizeUser
	
class UserAction(Event):
	TYPE = "user action"
	
	def __init__(self, action, snuggler, revisions, system_time=None):
		Event.__init__(self, self.TYPE, system_time)
		self.action    = action
		self.snuggler  = snuggler
		self.revisions = revisions
	
	def __eq__(self, other):
		return (
			Event.__eq__(self, other) and
			self.action == other.action and
			self.snuggler == other.snuggler and
			self.revisions == other.revisions
		)
	
	def deflate(self):
		doc = Event.deflate(self)
		doc['action']    = self.action.deflate()
		doc['snuggler']  = self.snuggler.deflate()
		doc['revisions'] = self.revisions
		return doc
	
	@staticmethod
	def inflate(doc):
		return UserAction(
			Action.inflate(doc['action']),
			User.inflate(doc['snuggler']),
			doc['revisions'],
			doc['system_time']
		)
Event.TYPES[UserAction.TYPE] = UserAction

	
class SnugglerLogin(Event):
	TYPE = "snuggler login"
	
	def __init__(self, snuggler, system_time=None):
		Event.__init__(self, self.TYPE, system_time)
		self.snuggler  = snuggler
	
	def __eq__(self, other):
		return (
			Event.__eq__(self, other) and
			self.snuggler == other.snuggler
		)
	
	def deflate(self):
		doc = Event.deflate(self)
		doc['snuggler']  = self.snuggler.deflate()
		return doc
	
	@staticmethod
	def inflate(doc):
		return SnugglerLogin(
			User.inflate(doc['snuggler']),
			doc['system_time']
		)
Event.TYPES[SnugglerLogin.TYPE] = SnugglerLogin

	
class SnugglerLogout(Event):
	TYPE = "snuggler logout"
	
	def __init__(self, snuggler, system_time=None):
		Event.__init__(self, self.TYPE, system_time)
		self.snuggler  = snuggler
	
	def __eq__(self, other):
		return (
			Event.__eq__(self, other) and
			self.snuggler == other.snuggler
		)
	
	def deflate(self):
		doc = Event.deflate(self)
		doc['snuggler']  = self.snuggler.deflate()
		return doc
	
	@staticmethod
	def inflate(doc):
		return SnugglerLogout(
			User.inflate(doc['snuggler']),
			doc['system_time']
		)
Event.TYPES[SnugglerLogout.TYPE] = SnugglerLogout


