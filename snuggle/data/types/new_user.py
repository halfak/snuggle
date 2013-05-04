from .activity import Activity
from .category import Category
from .data_type import DataType
from .desirability import Desirability
from .talk import Talk
from .user import User

class NewUser(User):
	
	def __init__(self, id, name, registration, views=0,
		         activity=None, desirability=None, talk=None, category=None):
		User.__init__(self, id, name)
		self.registration = int(registration)
		self.views        = 0
		self.activity     = activity if activity != None else Activity()
		self.desirability = desirability if desirability != None else Desirability()
		self.talk         = talk if talk != None else Talk()
		self.category     = category if category != None else Category()
	
	def __eq__(self, other):
		try:
			return (
				User.__eq__(self, other) and
				self.registration == other.registration and
				self.views == other.views and
				self.activity == other.activity and
				self.desirability == other.desirability and
				self.talk == other.talk and
				self.category == other.category
			)
		except AttributeError:
			return False
	
	def deflate(self):
		doc = User.deflate(self)
		doc['views']        = self.views
		doc['registration'] = self.registration
		doc['activity']     = self.activity.deflate()
		doc['desirability'] = self.desirability.deflate()
		doc['talk']         = self.talk.deflate()
		doc['category']     = self.category.deflate()
		return doc
	
	@staticmethod
	def inflate(doc):
		return NewUser(
			doc['_id'],
			doc['name'],
			doc['registration'],
			doc['views'],
			Activity.inflate(doc['activity']),
			Desirability.inflate(doc['desirability']),
			Talk.inflate(doc['talk']),
			Category.inflate(doc['category'])
		)
	
	

