import requests

class AuthErrorPass(Exception): pass
class AuthErrorName(Exception): pass
class ConnectionError(Exception): pass
class MWAPIError(Exception):
	
	def __init__(self, code, info):
		Exception.__init__(self, "%s: %s" % (code, info))
		self.code = code
		self.info = info

class API:
	
	def __init__(self, uri, headers=None):
		self.uri = uri
		self.headers = headers if headers != None else {}
		
		
		self.users = Users(self)
		self.pages = Pages(self)
		
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
			doc = r.json
		except ValueError as e:
			raise MWAPIError('value', "Could not decode json.")
		
		if 'error' in doc:
			raise MWAPIError(doc['error'].get('code'), doc['error'].get('info'))
		
		return doc, r.cookies
		
		
	@staticmethod
	def from_config(doc):
		return API(
			doc['mediawiki']['api']['uri'], 
			doc['mediawiki']['api'].get('headers')
		)


class APISubset:
	
	def __init__(self, api):
		self.api = api
		
class Users(APISubset):
	
	def authenticate(self, username, password):
		doc, cookies  = self.api.post(
			{
				'action': "login",
				'lgname': username,
				'lgpassword': password,
				'format': "json"
			}
		)
		
		doc, cookies = self.api.post(
			{
				'action': "login",
				'lgname': username,
				'lgpassword': password,
				'lgtoken': doc['login']['token'],
				'format': "json"
			},
			cookies = cookies
		)
		
		if doc['login']['result'] == "WrongPass":
			raise AuthErrorPass()
		elif doc['login']['result'] == "NotExists":
			raise AuthErrorName()
		elif doc['login']['result'] == "Success":
			return (
				doc['login']['lguserid'], #id 
				doc['login']['lgusername'], #name
				cookies #cookie
			)
		else:
			raise Exception("Unexpected login result: %s" % doc['login']['result'])


class Pages(APISubset):
	
	def get_markup(self, rev_id=None, page_id=None, title=None):
		
		if rev_id != None:
			data = {
				'revids': rev_id
			}
		elif page_id != None:
			data = {
				'pageids': page_id
			}
		elif title != None:
			data = {
				'titles': title
			}
		else:
			raise ValueError("Must specify rev_id, page_id or title.")
		
		data.update({
			'action': "query",
			'prop':   "revisions",
			'rvprop': "ids|content",
			'rvpst': 1,
			'format': "json"
		})
		doc, cookies = self.api.post(data)
		
		try:
			page = doc['query']['pages'].values()[0]
		except KeyError as e:
			raise MWAPIError('format', "API response has unexpected structure: %s" % doc)
		except IndexError as e:
			raise MWAPIError('format', "API response has unexpected structure: %s" % doc)
		
		if "missing" in page:
			return None, ""
		else:
			if len(page['revisions']) > 0:
				revision = page['revisions'][0]
				return revision.get('revid'), revision.get('*', "")
			else:
				return None, ""
			
	
	def watch(self, page_name,  cookies=None):
		doc, cookies = self.api.post(
			{
				'action': "query",
				'prop': "info",
				'titles': page_name,
				'intoken': "watch"
			},
			cookies = cookies
		)
		
		try:
			page = doc['query']['pages'].values()[0]
		except KeyError as e:
			raise MWAPIError('format', "API response has unexpected structure: %s" % doc)
		except IndexError as e:
			raise MWAPIError('format', "API response has unexpected structure: %s" % doc)
		
		doc, cookies = self.api.post(
			{
				'action': "watch",
				'title': page_name,
				'token': page['watchtoken']
			},
			cookies = cookies
		)
		
		try:
			if 'watched' in doc['watch']:
				return True
			else:
				raise MWAPIError('format', "API response has unexpected structure: %s" % doc)
		except KeyError as e:
			raise MWAPIError('format', "API response has unexpected structure: %s" % doc)
	
	def append(self, page_name, markup, cookies=None, comment=""):
		doc, cookies = self.api.post(
			{
				'action': "query",
				'prop': "info|revisions",
				'titles': page_name,
				'intoken': "edit",
				'summary': comment
			},
			cookies = cookies
		)
		
		try:
			page = doc['query']['pages'].values()[0]
		except KeyError as e:
			raise MWAPIError('format', "API response has unexpected structure.")
		except IndexError as e:
			raise MWAPIError('format', "API response has unexpected structure.")
		
		doc, cookies = self.api.post(
			{
				'action': "edit",
				'title': page_name,
				'appendtext': "\n\n" + markup,
				'token': page['edittoken'],
				'format': "json"
			},
			cookies = cookies
		)
		
		try:
			if doc['edit']['result'] == "Success":
				return doc['edit']['newrevid']
			else:
				raise MWAPIError(doc['edit']['result'], str(doc['edit']))
		except KeyError as e:
			raise MWAPIError('format', "API response has unexpected structure.")
		
		
	def preview(self, markup, page_name=None, cookies=None):
		doc, cookies = self.api.post(
			{
				'action': "parse",
				'title': page_name,
				'text': markup,
				'prop': "text",
				'pst': True
			},
			cookies = cookies
		)
		
		try:
			html = doc['parse']['text']['*']
		except KeyError as e:
			raise MWAPIError('format', "API response has unexpected structure.")
		except IndexError as e:
			raise MWAPIError('format', "API response has unexpected structure.")
		
		return html
