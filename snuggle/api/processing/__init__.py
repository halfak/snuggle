################################################################## processors.py
import bottle, os.path, time

from ..util import responses
from .users import Users
from .snugglers import Snugglers

class NonProcessor:
	
	def __getattribute__(self, attr):
		return responses.configuration_error()
		

processor = NonProcessor()

class Processor:
	
	def __init__(self, db, config):
		self.static = os.path.expanduser(
			os.path.join(config['root_directory'], "static")
		)
		self.initialized = time.time()
		self.users = Users(db, config)
		self.snugglers = Snugglers(db, config)
	
	def status(self):
		return responses.success(
			{
				'status': "online", 
				'up_time': time.time()-self.initialized
			}
		)
	
	def static_file(self, path):
		return bottle.static_file(path, root=self.static)
	


def configure(database, config):
	global processor
	processor = Processor(database, config)


