import logging, traceback, time, urllib
from bottle import request, redirect

from snuggle import errors, configuration
from snuggle.data import types
from snuggle.web.util import responses, user_data

logger = logging.getLogger("snuggle.web.processing.users")

class OAuth:
	def __init__(self, model, mwapi, oauth):
		self.model = model
		self.mwapi = mwapi
		self.oauth = oauth
	
	def initiate(self, session):
		authorize_url, request_token = self.oauth.initiate()
		session['request_token'] = request_token
		
		# return HTML to redirect user to mediawiki-login
		redirect(authorize_url)
	
	def complete(self, session, query_string):
		if 'request_token' not in session:
			return responses.session_error()
		else:
			access_token = self.oauth.complete(session['request_token'],
			                                   query_string)
		
		# Get user info
		identity = self.oauth.identify(access_token)
		id, name = identity['sub'], identity['username']
		
		# Store snuggler
		snuggler = types.Snuggler(id, name, access_token)
		session['snuggler'] = snuggler
		
		# Store event
		event = types.SnugglerLoggedIn(session['snuggler'])
		self.model.events.insert(event)
		
		# Return window closing script. 
		return """
		<html>
			<head>
				<script>window.close()</script>
			</head>
		</html>
		"""
