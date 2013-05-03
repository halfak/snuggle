import time


class Events:
	
	def __init__(self, mongo):
		self.mongo = mongo
	
	def insert(self, doc):
		doc['time'] = time.time()
		self.mongo.db.events.insert(doc)