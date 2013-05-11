from .data_type import DataType

class ByteDiff(DataType):
	
	def __init__(self, bytes, diff):
		self.bytes = int(bytes)
		self.diff  = int(diff) if diff != None else None
	
	def __eq__(self, other):
		try:
			return (
				self.bytes == other.bytes and
				self.diff == other.diff
			)
		except AttributeError:
			return False
	
	def deflate(self):
		return {
			'bytes': self.bytes,
			'diff':  self.diff
		}
	
	@staticmethod
	def inflate(json):
		return ByteDiff(
			json['bytes'],
			json['diff']
		)
