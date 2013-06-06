import time

from snuggle.data import types

from . import util

class Events:
	
	QUERYABLE_TYPES = set([
		types.UserActioned.TYPE,
		types.UserCategorized.TYPE,
		types.ServerStarted.TYPE,
		types.ServerStopped.TYPE
	])
	
	def __init__(self, mongo):
		self.mongo = mongo
	
	def insert(self, event):
		self.mongo.db.events.insert(util.mongoify(event.serialize()))
	
	def query(self, types=None, snuggler_name=None, 
	          sort_by="server_time", direction="descending", limit=1000):
		
		spec = {}
		
		if types == None:
			types = self.QUERYABLE_TYPES
		else:
			types = set(types) & self.QUERYABLE_TYPES
		
		spec['type'] = {'$in': [t.serialize() for t in types]}
		
		if snuggler_name != None: spec['snuggler.name'] = snuggler_name
		
		return self.mongo.db.events.find(
			spec,
			sort=(sort_by, 1 if direction == "ascending" else -1),
			limit=limit
		)
		
		