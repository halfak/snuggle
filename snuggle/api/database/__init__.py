import pymongo
from threading import Event

from .users import Users


class DB(object):
	
	accessors = set(['users'])
	def __init__(self):
		self.ready = Event()
		self.users = None
	
	def load(config):
		self.mongo = pymongo.MongoClient(host=config['database']['host'])[config['database']['database']]
		
		self.users = Users(self)
		self.ready.set()
		
	
	def __getattribute__(self, attr):
		if attr in self.accessors:
			self.ready.wait()
		
		return object.__getattribute__(self, attr)


db = DB()

def load(config):
	db.load(config)
