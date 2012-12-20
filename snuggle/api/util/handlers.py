from bottle import request

from . import responses

class query_data:
	def __init__(self, decoder=unicode):
		self.decoder = decoder
	
	def __call__(self, f):
		
		def wrapped_f(*args, **kwargs):
			query_data = kwargs['query']
			try:
				kwargs['data'] = self.decoder(query_data)
			except ValueError:
				return responses.decoding_error(query_data, self.decoder)
			
			return f(*args, **kwargs)
		
		return wrapped_f
	

class post_data:
	def __init__(self, decoder=unicode):
		self.decoder = decoder
	
	def __call__(self, f):
		
		def wrapped_f(*args, **kwargs):
			post_data = request.body.read()
			try:
				kwargs['data'] = self.decoder(post_data)
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
			return self.f(session, *args, **kwargs)
		else:
			return responses.session_error()
		
		

class authenticated:
	def __init__(self, f):
		self.f = f
	
	def __call__(self, *args, **kwargs):
		session = request.environ.get('beaker.session')
		
		if session != None and 'mw_user' in session:
			kwargs['session'] = session
			return self.f(session, *args, **kwargs)
		else:
			return responses.session_error()
