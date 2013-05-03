from .data_type import DataType

from user import NewUser
from revision import ChangeRevision

class Change(DataType):
	
	TYPES = {
		'new user': NewUser,
		'new revision': ChangeRevision
	}
	
	def __init__(self, id, timestamp, type, change, error=None):
		self.id        = int(id)
		self.timestamp = int(timestamp)
		self.type      = type; assert type in self.TYPES
		self.change    = change
		self.error     = error
		
	
	def set_error(self, error):
		self.error = unicode(error)
	
	def deflate(self):
		return {
			'_id':       self.id,
			'timestamp': self.timestamp,
			'type':      self.type,
			'change':    self.change.deflate(),
			'error':     self.error
		}
	
	@staticmethod
	def inflate(json):
		return Change(
			json['_id'],
			json['timestamp'],
			json['type'],
			Change.TYPES[json['type']].inflate(json['change']),
			json['error']
		)
