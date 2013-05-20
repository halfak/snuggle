import requests

from snuggle.errors import MWAPIError, AuthErrorPass, AuthErrorName, ConnectionError

from .pages import Pages
from .recent_changes import RecentChanges
from .revisions import Revisions
from .users import Users

class API:
	
	def __init__(self, uri, headers=None, comment_suffix=''):
		self.uri = uri
		
		self.headers = headers if headers != None else {}
		self.comment_suffix = unicode(comment_suffix)
		
		self.users = Users(self)
		self.pages = Pages(self)
		self.recent_changes = RecentChanges(self)
		self.revisions = Revisions(self)
		
	def post(self, params, cookies=None):
		if hasattr(params, 'keys'):
			params = [(k,v) for k,v in params.iteritems()]
		
		params.append(('format', "json"))
		
		try:
			print(params)
			r = requests.post(
				self.uri,
				params,
				cookies=cookies
			)
		except requests.ConnectionError as e:
			raise ConnectionError("Could not reach the API at %s: %s" % (self.uri, e))
		except requests.HTTPError as e:
			raise MWAPIError('http', HTTPError)
		
		try:
			doc = r.json()
			print(doc)
		except ValueError as e:
			raise MWAPIError('value', "Could not decode json: %s" % r.content)
		
		if 'error' in doc:
			raise MWAPIError(doc['error'].get('code'), doc['error'].get('info'))
		
		return doc, r.cookies
	
	@staticmethod
	def from_config(config):
		uri = "%s://%s%s%s" % (
			config.mediawiki['protocol'],
			config.mediawiki['domain'],
			config.mediawiki['path']['scripts'],
			config.mediawiki['file']['api']
		)
		headers = config.mediawiki['requests'].get('headers', {})
		comment_suffix = config.mediawiki['comment_suffix']
		return API(uri, headers, comment_suffix)


