from ..util import mediawiki, responses

class Snugglers:
	
	def __init__(self, db, config):
		self.mw = mediawiki.MW(config['mediawiki']['api_url'])
	
	def authenticate(self, session, creds):
		try:
			id, name, cookie = self.mw.users.authenticate(
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
		
		session['snuggler'] = {
			'meta': {
				'id': id,
				'name': name
			},
			'cookie': cookie
		}
		return responses.success(session['snuggler']['meta'])
	
	def log_out(self, session):
		if 'snuggler' in session:
			del session['snuggler']
			return responses.success(True)
		else:
			return responses.success("Not logged in.")
		
	def status(self, session):
		if 'snuggler' in session:
			return responses.success({'logged_in': True, 'user': session['snuggler']['meta']})
		else:
			return responses.success({'logged_in': False})
		
	
	
