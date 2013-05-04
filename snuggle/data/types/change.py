from .data_type import DataType

from .new_user import NewUser
from .revision import ChangeRevision

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
		self.error     = unicode(error) if error != None else None
	
	def __eq__(self, other):
		try:
			return (
				self.id == other.id and
				self.timestamp == other.timestamp and
				self.type == other.type and
				self.change == other.change and
				self.error == other.error
			)
		except AttributeError:
			return False
	
	def deflate(self):
		return {
			'_id':       self.id,
			'timestamp': self.timestamp,
			'type':      self.type,
			'change':    self.change.deflate(),
			'error':     self.error
		}
	
	def set_error(self, error):
		self.error = unicode(error)
	
	@staticmethod
	def inflate(json):
		return Change(
			json['_id'],
			json['timestamp'],
			json['type'],
			Change.TYPES[json['type']].inflate(json['change']),
			json['error']
		)
