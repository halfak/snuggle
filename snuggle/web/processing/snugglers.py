
from snuggle import mediawiki
from snuggle.data import types
from snuggle.web.util import responses

class Snugglers:
	
	def __init__(self, model, mwapi):
		self.model = model
		self.mwapi = mwapi
	
	def authenticate(self, session, creds):
		try:
			id, name, cookies = self.mwapi.users.authenticate(
				creds['user'],
				creds['pass']
			)
		except KeyError as e:
			return responses.missing_parameter(e)
		except mediawiki.AuthErrorPass:
			return responses.auth_error("password")
		except mediawiki.AuthErrorName:
			return responses.auth_error("username")
		except mediawiki.ConnectionError as e:
			return responses.mediawiki_error("authenticating a snuggler", "connection", str(e))
		except:
			return responses.general_error("checking credentials with mediawiki")
		
		session['snuggler'] = types.Snuggler(id, name, cookies)
		
		try:
			event = types.SnugglerLogin(session['snuggler'])
			self.model.events.insert(event)
		except Exception as e:
			logger.error(traceback.format_exc())
		
		return responses.success(session['snuggler'].deflate())
	
	def log_out(self, session):
		if 'snuggler' in session:
			try:
				event = types.SnugglerLogout(session['snuggler'])
				self.model.events.insert(event)
			except Exception as e:
				logger.error(traceback.format_exc())
			
			del session['snuggler']
			
			return responses.success(True)
		else:
			return responses.success("Not logged in.")
		
	def status(self, session):
		if 'snuggler' in session:
			return responses.success({'logged_in': True, 'snuggler': session['snuggler'].deflate()})
		else:
			return responses.success({'logged_in': False})
		
	
	
