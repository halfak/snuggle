import time

from .action import Action
from .data_type import DataType
from .revision import UserRevision
from .user import User

class Event(DataType):
	TYPES = {}
	
	def __init__(self, system_time=None):
		self.system_time = float(system_time) if system_time != None else time.time()
	
	def __eq__(self, other):
		return (
			self.TYPE == other.TYPE and
			self.system_time == other.system_time
		)
	
	def deflate(self):
		return {
			'type': self.TYPE,
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
		Event.__init__(self, system_time)
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
		Event.__init__(self, system_time)
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

class UserQuery(Event):
	TYPE = "user query"
	
	def __init__(self, query, wait_time, response_length, snuggler=None, data=None, system_time=None):
		Event.__init__(self, system_time)
		self.query = query
		self.wait_time = float(wait_time)
		self.response_length = int(response_length)
		self.snuggler = snuggler
		self.data = data
	
	def __eq__(self, other):
		try:
			return (
				Event.__eq__(self, other) and
				self.query == other.query and
				self.wait_time == other.wait_time and
				self.response_length == other.response_length and
				self.snuggler == other.snuggler and
				self.data == other.data
			)
		except AttributeError:
			return False
	
	def deflate(self):
		doc = Event.deflate(self)
		doc['query'] = self.query
		doc['wait_time'] = self.wait_time
		doc['response_length'] = self.response_length
		doc['snuggler'] = self.snuggler.deflate() if self.snuggler != None else None
		doc['data'] = self.data
		return doc
	
	@staticmethod
	def inflate(doc):
		return Query(
			doc['query'],
			doc['wait_time'],
			doc['response_length'],
			doc['snuggler'],
			doc['data'],
			doc['system_time']
		)
UserQuery.TYPES[UserQuery.TYPE] = UserQuery
		

class ViewUser(Event):
	TYPE = "view user"
	
	def __init__(self, user, snuggler, system_time=None):
		Event.__init__(self, system_time)
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
		Event.__init__(self, system_time)
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
		Event.__init__(self, system_time)
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
		Event.__init__(self, system_time)
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
		Event.__init__(self, system_time)
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
		Event.__init__(self, system_time)
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


