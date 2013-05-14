import time

from . import category
from .action import Action
from .data_type import DataType
from .revision import UserRevision
from .user import User

EVENT_TYPES = {}

class Event(DataType):
	
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
		EventClass = EVENT_TYPES[doc['type']]
		return EventClass.inflate(doc)

EVENT_TYPES[ViewUser.TYPE] = ViewUser

class SystemStart(Event):
	TYPE = "system start"
	
	SERVERS = set(['sync', 'web'])
	
	def __init__(self, server):
		self.server = server; assert server in self.SERVERS
	
	def deflate(self):
		doc = Event.deflate(self)
		doc['server'] = self.server
	
	
EVENT_TYPES[SystemStart.TYPE] = SystemStart

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
EVENT_TYPES[ViewUser.TYPE] = ViewUser

class CategorizeUser(Event):
	TYPE = "categorizer user"
	
	def __init__(self, user, snuggler, cat, system_time=None):
		Event.__init__(self, self.TYPE, system_time)
		self.user  = user
		self.snuggler = snuggler
		self.category = cat; assert cat in category.CATEGORIES
	
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
EVENT_TYPES[CategorizeUser.TYPE] = CategorizeUser
	
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
		doc['revisions'] = [r.deflate() for r in self.revisions]
		return doc
	
	@staticmethod
	def inflate(doc):
		return UserAction(
			Action.inflate(doc['action']),
			User.inflate(doc['snuggler']),
			[UserRevision.inflate(r_doc) for r_doc in doc['revisions']],
			doc['system_time']
		)
EVENT_TYPES[UserAction.TYPE] = UserAction


