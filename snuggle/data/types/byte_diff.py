from .data_type import DataType

class ByteDiff(DataType):
	
	def __init__(self, bytes, diff):
		self.bytes = int(bytes)
		self.diff  = int(diff)
	
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
