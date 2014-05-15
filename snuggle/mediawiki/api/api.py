import requests
from requests_oauthlib import OAuth1
from mwoauth import ConsumerToken

from snuggle.errors import MWAPIError, AuthErrorPass, AuthErrorName, ConnectionError
from snuggle import configuration

from .pages import Pages
from .recent_changes import RecentChanges
from .revisions import Revisions
from .users import Users

class API:
	
	def __init__(self, uri, consumer_token, headers=None, comment_suffix=''):
		self.uri = uri
		self.consumer_token = consumer_token
		
		self.headers = headers if headers != None else {}
		self.comment_suffix = unicode(comment_suffix)
		
		self.users = Users(self)
		self.pages = Pages(self)
		self.recent_changes = RecentChanges(self)
		self.revisions = Revisions(self)
	
	def post(self, params, access_token=None):
		
		if access_token != None:
			auth = OAuth1(
				self.consumer_token.key,
				client_secret = self.consumer_token.secret,
				resource_owner_key = access_token.key,
				resource_owner_secret = access_token.secret
			)
		else:
			auth=None
			
		params['format'] = "json"
		
		try:
			#print(params)
			r = requests.post(
				self.uri,
				params=params,
				auth=auth
			)
		except requests.ConnectionError as e:
			raise ConnectionError("Could not reach the API at %s: %s" % (self.uri, e))
		except requests.HTTPError as e:
			raise MWAPIError('http', HTTPError)
		
		try:
			if callable(r.json):
				doc = r.json()
			else:
				doc = r.json
		except ValueError as e:
			raise MWAPIError('value', "Could not decode json: %s" % r.content)
		
		if 'error' in doc:
			raise MWAPIError(doc['error'].get('code'), doc['error'].get('info'))
		
		return doc
	
	@staticmethod
	def from_config(config):
		uri = "%s://%s%s%s" % (
			config.mediawiki['protocol'],
			config.mediawiki['domain'],
			config.mediawiki['path']['scripts'],
			config.mediawiki['file']['api']
		)
		
		consumer_token = ConsumerToken(
			configuration.snuggle['oauth']['consumer_key'],
			configuration.snuggle['oauth']['consumer_secret']
		)
		
		headers = config.mediawiki['requests'].get('headers', {})
		comment_suffix = config.mediawiki['comment_suffix']
		
		return API(uri, consumer_token, headers=headers, comment_suffix=comment_suffix)


