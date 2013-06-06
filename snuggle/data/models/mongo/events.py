import time

from . import util

EVENT_FIELDS = [
	'user',
	'snuggler',
	'category',
	'request'
]

class Events:
	
	QUERYABLE_TYPES = set(['user action', 'categorize user', 'system start', 'system stop'])
	
	def __init__(self, mongo):
		self.mongo = mongo
	
	def insert(self, event):
		self.mongo.db.events.insert(util.mongoify(event.serialize()))
	
	def query(self, types=None, snuggler_name=None, sort_by="server_time", 
	          direction="descending", limit=1000):
		
		spec = {}
		
		if type != None and types-self.QUERYABLE_TYPES: 
			spec['type'] = {'$in': [type]}
		else:
			spec['type'] = {'$in': QUERYABLE_TYPES}
		
		if snuggler_name != None: spec['snuggler.name'] = snuggler_name
		
		return self.mongo.db.events.find(
			spec,
			fields=EVENT_FIELDS,
			sort=(sort_by, 1 if direction == "ascending" else -1),
			limit=limit
		)
	
	# TODO: This is shitty.  Make it unshitty
	def _clean_events(event_docs):
		for doc in event_docs:
			if doc['type'] == "user action":
				doc['results'] = [r for r in results if r['type'] != "watch result"]
			
			yield util.demongoify(doc)
		
		