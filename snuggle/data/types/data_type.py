
class DataType:
	
	
	def __eq__(self, other):
		raise NotImplementedError()
	
	def __neq__(self, other):
		return not self.__eq__(other)
		
	def deflate(self): raise NotImplementedError()
	
	@staticmethod
	def inflate(json): raise NotImplementedError()
