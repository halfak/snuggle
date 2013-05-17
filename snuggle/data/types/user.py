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
			return False
	
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
		title = title.replace("_", " ")
		if len(title) > 1:
			return title[0].capitalize() + title[1:]
		elif len(title) == 1:
			return title.capitalize()
		else:
			return ""
	

