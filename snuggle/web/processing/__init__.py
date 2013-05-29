import bottle, os.path, time, logging, traceback

from snuggle import mediawiki, configuration
from snuggle.data import types
from snuggle.util import import_class
from snuggle.web.util import responses, user_data

from .config import Config
from .snugglers import Snugglers
from .users import Users

logger = logging.getLogger("snuggle.web.processing")

class NonProcessor:
	
	def __getattribute__(self, attr):
		return responses.configuration_error()
		
processor = NonProcessor()

class Processor:
	
	def __init__(self, model, mwapi, actor, static_dir):
		self.model = model
		self.mwapi = mwapi
		self.static_dir = static_dir
		
		self.initialized = time.time()
		
		self.users = Users(model, mwapi, actor)
		self.snugglers = Snugglers(model, mwapi)
		self.config = Config()
	
	def status(self):
		return responses.success(
			{
				'status': "online", 
				'up_time': time.time()-self.initialized
			}
		)
	
	def help(self, data):
		path = os.path.join(self.static_dir, "help", "%(lang)s.html" % data)
		
		f = open(path)
		
		return responses.success(f.read())
	
	def default(self):
		try:
			snuggler, data = user_data()
			event = types.UILoaded(
				snuggler,
				data
			)
			self.model.events.insert(event)
		except Exception as e:
			logger.error("An error occurred while logging UILoaded event: %s" % traceback.format_exc())
		
		return self.static_file("index.html")
	
	def static_file(self, path):
		return bottle.static_file(path, root=self.static_dir)
	
	@staticmethod
	def from_config(config, model):
		static_dir = os.path.expanduser(
			os.path.join(config.snuggle['root_directory'], "static")
		)
		mwapi = mediawiki.API.from_config(config)
		user_actions = mediawiki.UserActions.from_config(config)
		return Processor(
			model,
			mwapi,
			user_actions,
			static_dir
		)


def configure(config, model):
	global processor
	processor = Processor.from_config(config, model)


