import json, bottle
from responses import Success, Error

class json_data:
	def __init__(self, f):
		self.f = f
	
	def __call__(self, string):
		try:
			doc = json.loads(string)
		except:
			return Error("json_decode", "Could not decode json: %s" % string).deflate()
			
		return self.f(doc)


class session:
	def __init__(self, f):
		self.f = f
	
	def __call__(self, *args, **kwargs):
		session = bottle.request.environ.get('beaker.session')
		
		
	

class authenticated:
	def __init__(self, f):
