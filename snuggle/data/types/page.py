from . import serializable

class Page(serializable.Type):
	
	def __init__(self, id, title, namespace):
		self.id        = int(id)
		self.title     = unicode(title)
		self.namespace = int(namespace)
	
	@staticmethod
	def normalize(name):
		return name.replace(" ", "_").capitalize()

