import logging, traceback

from snuggle import mediawiki
from snuggle import errors
from snuggle.data import types
from snuggle.web.util import responses

logger = logging.getLogger("snuggle.web.processing.snugglers")

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
			logger.error(traceback.format_exc())
			return responses.missing_parameter(e)
		except errors.AuthErrorPass:
			return responses.auth_error("password")
		except errors.AuthErrorName:
			return responses.auth_error("username")
		except errors.ConnectionError as e:
			logger.error(traceback.format_exc())
			return responses.mediawiki_error("authenticating a snuggler", "connection", str(e))
		except Exception as e:
			logger.error(traceback.format_exc())
			return responses.general_error("checking credentials with mediawiki")
		
		session['snuggler'] = types.Snuggler(id, name, cookies)
		
		try:
			event = types.SnugglerLogin(session['snuggler'])
			self.model.events.insert(event)
		except Exception as e:
			logger.error(traceback.format_exc())
		
		return responses.success(session['snuggler'].serialize())
	
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
			return responses.success({'logged_in': True, 'snuggler': session['snuggler'].serialize()})
		else:
			return responses.success({'logged_in': False})
		
	
	
