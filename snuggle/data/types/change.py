from .data_type import DataType

from user import NewUser, Revision

class Change(DataType):
	
	TYPES = {
		'new user': NewUser,
		'new revision': Revision
	}
	
	def __init__(self, id, timestamp, type, change):
		self.id        = int(id)
		self.timestamp = int(timestamp)
		self.type      = type
		self.change    = change
		
	
	def deflate(self):
		return {
			'_id':       self.id,
			'timestamp': self.timestamp,
			'type':      self.type,
			'change':    self.change.deflate()
		}
	
	@staticmethod
	def inflate(json):
		return Change(
			json['_id'],
			json['timestamp'],
			json['type'],
			Change.TYPES[json['type']].inflate(json['change'])
		)
