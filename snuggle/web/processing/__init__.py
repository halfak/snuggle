################################################################## processors.py
import bottle, os.path, time

from snuggle import mediawiki
from snuggle.util import import_class
from snuggle.web.util import responses

from .users import Users
from .snugglers import Snugglers

class NonProcessor:
	
	def __getattribute__(self, attr):
		return responses.configuration_error()
		

processor = NonProcessor()

class Processor:
	
	def __init__(self, model, mwapi, static_dir):
		self.static_dir = static_dir
		
		self.initialized = time.time()
		self.users = Users(model, mwapi)
		self.snugglers = Snugglers(model, mwapi)
	
	def status(self):
		return responses.success(
			{
				'status': "online", 
				'up_time': time.time()-self.initialized
			}
		)
	
	def static_file(self, path):
		return bottle.static_file(path, root=self.static_dir)
	
	@staticmethod
	def from_config(doc):
		Model = import_class(doc['model']['module'])
		
		static_dir = os.path.expanduser(
			os.path.join(doc['root_directory'], "static")
		)
		return Processor(
			Model.from_config(doc),
			mediawiki.API.from_config(doc), 
			static_dir
		)


def configure(doc):
	global processor
	processor = Processor.from_config(doc)


