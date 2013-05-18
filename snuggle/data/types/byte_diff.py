from . import serializable

class ByteDiff(serializable.Type):
	
	def __init__(self, bytes, diff):
		self.bytes = int(bytes)
		self.diff  = int(diff) if diff != None else None
