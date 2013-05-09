import bottle, os.path, time

from snuggle import mediawiki
from snuggle import configuration
from snuggle.util import import_class
from snuggle.web.util import responses

from .config import Config
from .snugglers import Snugglers
from .users import Users

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
		self.config = Config()
	
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
	def from_config(config):
		Model = import_class(config['model']['module'])
		
		static_dir = os.path.expanduser(
			os.path.join(config['root_directory'], "static")
		)
		return Processor(
			Model.from_config(config),
			mediawiki.API.from_config(configuration.mediawiki),
			static_dir
		)


def configure(doc):
	global processor
	processor = Processor.from_config(doc)


