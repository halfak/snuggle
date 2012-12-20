import json
from threading import Event

class Config:
	
	def __init__(self):
		self.doc = {}
		self.ready = Event()
	
	def load(self, doc):
		self.doc.update(doc)
		self.ready.set()
	
	def __getitem__(self, key):
		self.ready.wait()
		
		return self.doc['key']

config = Config()

def load(filename):
	global config
	f = open(filename)
	doc = json.load(f)
	
	config.load(doc)

