import requests

from .errors import MWAPIError, AuthErrorPass, AuthErrorName, ConnectionError
from .pages import Pages
from .recent_changes import RecentChanges
from .revisions import Revisions
from .users import Users

class API:
	
	def __init__(self, uri, headers=None):
		self.uri = uri
		
		self.headers = headers if headers != None else {}
		
		self.users = Users(self)
		self.pages = Pages(self)
		self.recent_changes = RecentChanges(self)
		self.revisions = Revisions(self)
		
	def post(self, params, cookies=None):
		params['format'] = "json"
		
		try:
			r = requests.post(
				self.uri,
				params,
				cookies=cookies
			)
		except requests.ConnectionError as e:
			raise ConnectionError("Could not reach the API at %s: %s" % (self.url, e))
		except requests.HTTPError as e:
			raise MWAPIError('http', HTTPError)
		
		try:
			doc = r.json()
		except ValueError as e:
			raise MWAPIError('value', "Could not decode json: %s" % r.content)
		
		if 'error' in doc:
			raise MWAPIError(doc['error'].get('code'), doc['error'].get('info'))
		
		return doc, r.cookies
	
	@staticmethod
	def from_config(config):
		uri = "%s://%s%s%s" % (
			config['protocol'],
			config['domain'],
			config['path']['scripts'],
			config['file']['api']
		)
		headers = config['requests'].get('headers', {})
		return API(uri, headers)


