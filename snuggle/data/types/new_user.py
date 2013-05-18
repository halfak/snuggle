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
		self.activity     = Activity.deserialize(activity) if activity != None else Activity()
		self.desirability = Desirability.deserialize(desirability) if desirability != None else Desirability()
		self.talk         = Talk.deserialize(talk) if talk != None else Talk()
		self.category     = Category.deserialize(category) if category != None else Category()
	

