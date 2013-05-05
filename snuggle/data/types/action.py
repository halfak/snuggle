from .data_type import DataType

from .user import User

ACTIONS = {}

class Action(DataType):
	TYPE = NotImplemented
	
	def __init__(self, type, user):
		self.type = type; assert type in ACTIONS
		self.user = user
	
	def __eq__(self, other):
		try:
			return (
				self.type == other.type and
				self.user == other.user
			)
		except AttributeError:
			return False
	
	def deflate(self):
		return {
			'type': self.type,
			'user': self.user.deflate()
		}
	
	def markup(self):
		raise NotImplementedError()
	
	@staticmethod
	def inflate(doc):
		ActionClass = ACTIONS[doc['type']]
		return ActionClass.inflate(doc)


class SendMessage(Action):
	TYPE = "send message"
	
	def __init__(self, user, header, message):
		Action.__init__(self, self.TYPE, user)
		self.header = header
		self.message = message
	
	def __eq__(self, other):
		try:
			return (
				Action.__eq__(self, other) and
				self.header == other.header and
				self.message == other.message
			)
		except AttributeError:
			return False
	
	def deflate(self):
		doc = Action.deflate(self)
		doc['header'] = self.header
		doc['message'] = self.message
		
		return doc
	
	def markup(self):
		return (
			"== %s ==\n" + 
			"%s~~~~\n"
		) % (self.header, self.message)
	
	@staticmethod
	def inflate(doc):
		return SendMessage(
			User.inflate(doc['user']),
			doc['header'],
			doc['message']
		)
ACTIONS[SendMessage.TYPE] = SendMessage

class TeahouseInvite(Action):
	TYPE = "teahouse invite"
	
	def __init__(self, user, header, message, template):
		Action.__init__(self, self.TYPE, user)
		self.header = header
		self.message = message
		self.template = template
	
	def __eq__(self, other):
		try:
			return (
				Action.__eq__(self, other) and
				self.header == other.header and
				self.message == other.message and
				self.template == other.template
			)
		except AttributeError:
			return False
	
	def deflate(self):
		doc = Action.deflate(self)
		doc['header'] = self.header
		doc['message'] = self.message
		doc['template'] = self.template
		
		return doc
	
	def markup(self):
		return (
			"== %s ==\n" + 
			"{{subst:Wikipedia:Teahouse/%s|message=%s|sign=~~~~}}\n"
		) % (self.header, self.template, self.message)
	
	@staticmethod
	def inflate(doc):
		return TeahouseInvite(
			User.inflate(doc['user']),
			doc['header'],
			doc['message'],
			doc['template']
		)
ACTIONS[TeahouseInvite.TYPE] = TeahouseInvite

class ReportVandalism(Action):
	TYPE = "report vandalism"
	
	def __init__(self, user, reason):
		Action.__init__(self, self.TYPE, user)
		self.reason = reason
	
	def __eq__(self, other):
		try:
			return (
				Action.__eq__(self, other) and
				self.reason == other.reason
			)
		except AttributeError:
			return False
	
	def deflate(self):
		doc = Action.deflate(self)
		doc['reason'] = self.reason
		
		return doc
	
	def markup(self):
		return (
			"* {{Vandal|%s}} %s~~~~"
		) % (self.user.name, self.reason)
	
	@staticmethod
	def inflate(doc):
		return ReportVandalism(
			User.inflate(doc['user']),
			doc['reason']
		)
ACTIONS[ReportVandalism.TYPE] = ReportVandalism
