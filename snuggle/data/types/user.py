from .data_type import DataType

class User(DataType):
	
	def __init__(self, id, name):
		self.id   = int(id)
		self.name = unicode(name)
	
	def __eq__(self, other):
		try:
			return (
				self.id == other.id and
				self.name == other.name
			)
		except AttributeError:
			raise False
	
	def deflate(self):
		return {
			'_id':   self.id,
			'name':  self.name
		}
	
	@staticmethod
	def inflate(doc):
		return User(
			doc['_id'],
			doc['name']
		)
	
	@staticmethod
	def normalize(title):
		return title.replace("_", " ").capitalize()
	

