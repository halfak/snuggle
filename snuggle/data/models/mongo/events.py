import time

from . import util

class Events:
	
	def __init__(self, mongo):
		self.mongo = mongo
	
	def insert(self, event):
		self.mongo.db.events.insert(util.mongoify(event.serialize()))
	
	# TODO: finish this
	# TODO: Make "type" a set
	def query(self, type=None, action=None, sort_by="server_time", 
	          direction="descending", limit=1000):
		
		spec = {}
		
		if type != None: spec['type'] = type
		if action != None: spec['action'] = action
		
		
		return self.mongo.db.events.find(
			spec,
			sort=(sort_by, 1 if direction == "ascending" else -1),
			limit=limit
		)
		