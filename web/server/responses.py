import time, traceback

class Response:
	
	def __init__(self, meta=None):
		self.meta    = meta if meta != None else {}
		self.meta.update(
			{'time': time.time()} if __debug__ else {}
		)
	
	def deflate(self): raise NotImplementedError()

class Error(Response):
	
	def __init__(self, code, message, meta=None):
		Response.__init__(self, meta)
		self.code    = unicode(code)
		self.message = unicode(message)
		self.meta.update(
			{'exception': traceback.format_exc()} if __debug__ else {}
		)
	
	def deflate(self):
		return {
			'error': {
				'code':    self.code,
				'message': self.message,
				'meta':    self.meta
			}
		}
		

class Success(Response):
	
	def __init__(self, payload, meta=None):
		Response.__init__(self, meta)
		self.payload = payload
	
	def deflate(self):
		return {
			'success': {
				'payload': self.payload,
				'meta':    self.meta
			}
		}
