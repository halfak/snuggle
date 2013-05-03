import pymongo

from .users import Users
from .snugglers import Snugglers


class DB:
	def __init__(self, config):
		self.mongo = pymongo.MongoClient(host=config['database']['host'])[config['database']['database']]
		
		if 'authentication' in config['database']:
			self.mongo.authenticate(
				config['database']['authentication']['user'],
				config['database']['authentication']['pass']
			)
		
		self.users = Users(self)
		self.snugglers = Snugglers(self)
