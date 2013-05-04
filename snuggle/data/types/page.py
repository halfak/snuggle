from .data_type import DataType

class Page(DataType):
	
	def __init__(self, id, title, namespace):
		self.id        = int(id)
		self.title     = unicode(title)
		self.namespace = int(namespace)
	
	def __eq__(self, other):
		try:
			return (
				self.id == other.id and
				self.title == other.title and
				self.namespace == other.namespace
			)
		except AttributeError:
			return False
	
	def deflate(self):
		return {
			'_id': self.id,
			'title': self.title,
			'namespace': self.namespace
		}
	
	@staticmethod
	def inflate(json):
		return Page(
			json['_id'],
			json['title'],
			json['namespace']
		)
		
	@staticmethod
	def normalize(name):
		return name.replace(" ", "_").capitalize()

