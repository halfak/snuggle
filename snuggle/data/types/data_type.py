
class DataType:
	
	def deflate(self): raise NotImplementedError()
	
	@staticmethod
	def inflate(json): raise NotImplementedError()
