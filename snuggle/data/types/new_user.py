from .activity import Activity
from .category import Category
from .desirability import Desirability
from .talk import Talk
from .user import User

class NewUser(User):
	
	def __init__(self, id, name, registration, views=0, 
	             has_talk_page=False, has_user_page=False,
	             activity=None, desirability=None, talk=None, category=None):
		User.__init__(self, id, name)
		self.registration  = int(registration)
		self.views         = views
		self.activity      = Activity.deserialize(activity) if activity != None else Activity()
		self.desirability  = Desirability.deserialize(desirability) if desirability != None else Desirability()
		self.talk          = Talk.deserialize(talk) if talk != None else Talk()
		self.category      = Category.deserialize(category) if category != None else Category()
		
		self.has_talk_page = has_talk_page or self.talk.last_id != 0
		self.has_user_page = has_user_page
	

