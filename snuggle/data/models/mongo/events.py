import time




class Events:
	
	def __init__(self, mongo):
		self.mongo = mongo
	
	def insert(self, doc):
		doc['system_time'] = time.time()
		self.mongo.db.events.insert(doc)