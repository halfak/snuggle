from bottle import request, response

from snuggle.web import processing
from snuggle.web.util import responses

class query_data:
	def __init__(self, decoder=unicode):
		self.decoder = decoder
	
	def __call__(self, f):
		
		def wrapped_f(*args, **kwargs):
			query_data = kwargs['query']
			del kwargs['query']
			try:
				kwargs['data'] = self.decoder(query_data)
			except ValueError:
				return responses.decoding_error(query_data, self.decoder)
			
			return f(*args, **kwargs)
		
		return wrapped_f
	

class post_data:
	def __init__(self, decoder=unicode, field_name="data"):
		self.decoder = decoder
		self.field_name = field_name
	
	def __call__(self, f):
		
		def wrapped_f(*args, **kwargs):
			post_data = request.body.read()
			try:
				kwargs[self.field_name] = self.decoder(post_data)
			except ValueError:
				return responses.decoding_error(post_data, self.decoder)
			
			return f(*args, **kwargs)
		
		return wrapped_f

class session:
	def __init__(self, f):
		self.f = f
	
	def __call__(self, *args, **kwargs):
		session = request.environ.get('beaker.session')
		if session != None:
			kwargs['session'] = session
			return self.f(*args, **kwargs)
		else:
			return responses.session_error()
		
		
		
class authenticated:
	def __init__(self, action=None):
		self.action = action
	
	def __call__(self, f):
		
		def wrapped_f(*args, **kwargs):
			session = request.environ.get('beaker.session')
			
			if session != None:
				if 'snuggler' in session:
					kwargs['session'] = session
					return f(*args, **kwargs)
				else:
					return responses.auth_required_error(self.action)
			else:
				return responses.session_error()
		
		return wrapped_f
	
class log_event:
	def __init__(self, doc):
		self.doc = doc
	
	def __call__(self, f):
		
		wrapped_f(*args, **kwargs):
			doc = dict(self.doc)
			session = request.environ.get('beaker.session')
			
			if session != None:
				if 'snuggler' in session:
					doc['snuggler'] = session['snuggler'].deflate()
				else:
					doc['snuggler'] = None
			else:
				doc['snuggler'] = None
			
			ret = f(*args, **kwargs)
			
			processing.processor.model.events.insert(doc)
			
			return ret
			



def content_type(type):
	def decorator(f):
		def g(*a, **k):
			response.content_type = type
			return f(*a, **k)
		return g
	return decorator
