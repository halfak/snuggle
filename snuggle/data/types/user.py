from .data_type import DataType

class User(DataType):
	
	def __init__(self, id, name):
		self.id   = int(id)
		self.name = unicode(name)
	
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
	


class NewUser(User):
	
	def __init__(self, id, name, registration):
		User.__init__(self, id, name)
		self.registration = int(registration)
	
	def deflate(self):
		json = User.deflate(self)
		json['registration'] = self.registration
		return json
	
	@staticmethod
	def inflate(json):
		return NewUser(
			json['_id'],
			json['name'],
			json['registration']
		)

