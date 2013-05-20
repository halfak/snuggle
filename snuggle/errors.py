# Web processing errors
class AuthErrorPass(Exception): pass
class AuthErrorName(Exception): pass
class ConnectionError(Exception): pass
class MWAPIError(Exception):
	
	def __init__(self, code, info):
		Exception.__init__(self, "%s: %s" % (code, info))
		self.code = code
		self.info = info


# User Actions
class InvalidAction(Exception): pass

