import time, sys

from snuggle.data import types as data_types

from . import util

class Events:
	def __init__(self, mongo):
		self.mongo = mongo
	
	def insert(self, event):
		self.mongo.db.events.insert(util.mongoify(event.serialize()))
	
	def query(self, types=None, snuggler_name=None, after=None, before=None, 
	          sort_by="system_time", direction="descending", limit=1000,
	          deserialize=True):
		
		query = {
			'spec': {},
			'sort':[(sort_by, 1 if direction == "ascending" else -1)],
			'limit': limit
		}
		
		if types in (None, []):
			types = data_types.Event.PUBLIC_TYPES
		else:
			types = (
				set(data_types.List.deserialize(data_types.EventType, types)) & 
				data_types.Event.PUBLIC_TYPES
			)
		
		# This is gross, but here we are.  It turns out that Mongo can't handle
		# unordered document matches.  
		query['spec'] = {'$or': [
				{'type.entity': t.entity, 'type.action': t.action} 
				for t in types
			]
		}
			
		if snuggler_name not in ("", None): query['spec']['snuggler.name'] = snuggler_name
		if after != None: query['spec']['system_time'] = {'$gt': after}
		if before != None: query['spec']['system_time'] = {'$lt': before}
		
		docs = self.mongo.db.events.find(**query)
		
		if deserialize:
			return (data_types.Event.deserialize(util.demongoify(doc)) for doc in docs)
		else:
			return (util.demongoify(doc) for doc in docs)
		