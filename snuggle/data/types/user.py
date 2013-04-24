from .activity import Activity
from .data_type import DataType
from .desirability import Desirability

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
	
	def __init__(self, id, name, registration, activity, desirability):
		User.__init__(self, id, name)
		self.registration = int(registration)
		self.activity     = activity
		self.desirability = desirability
	
	def deflate(self):
		doc = User.deflate(self)
		doc['registration'] = self.registration
		doc['activity']     = self.activity.deflate()
		doc['desirability'] = self.desirability.deflate()
		return doc
	
	@staticmethod
	def inflate(doc):
		return NewUser(
			doc['_id'],
			doc['name'],
			doc['registration'],
			Activity.inflate(doc['activity']),
			Desirability.inflate(doc['desirability'])
		)
	
	

