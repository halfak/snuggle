from . import serializable

class User(serializable.Type):
	
	def __init__(self, id, name):
		self.id  = int(id)
		self.name = unicode(name)
	
	@staticmethod
	def normalize(title):
		title = title.replace("_", " ")
		if len(title) > 1:
			return title[0].capitalize() + title[1:]
		elif len(title) == 1:
			return title.capitalize()
		else:
			return ""
	

class Snuggler(User, serializable.Type):
	
	def __init__(self, id, name, oauth=None):
		User.__init__(self, id, name)
		self.oauth = oauth
	
	def __eq__(self, other):
		try:
			return (
				User.__eq__(self, other) and
				self.oauth == other.oauth
			)
		except AttributeError:
			return False
	
	def serialize(self):
		"""
		Overriding so that we forget oauth whenever we store snuggler info
		"""
		return {
			'id': self.id,
			'name': self.name
		}
