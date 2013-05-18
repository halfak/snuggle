from . import serializable
from .new_user import NewUser
from .revision import ChangeRevision

class Change(serializable.Type):
	
	TYPES = {
		'new user': NewUser,
		'new revision': ChangeRevision
	}
	
	def __init__(self, id, timestamp, type, change, error=None):
		self.id        = int(id)
		self.timestamp = int(timestamp)
		self.type      = type; assert type in self.TYPES
		self.error     = unicode(error) if error != None else None
		
		ChangeType = self.TYPES[self.type]
		self.change    = ChangeType.deserialize(change)
	
	def set_error(self, error):
		self.error = unicode(error)
