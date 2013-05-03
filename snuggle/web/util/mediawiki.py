import requests, json

class AuthErrorPass(Exception): pass
class AuthErrorName(Exception): pass
class ConnectionError(Exception): pass
class MWAPIError(Exception):
	
	def __init__(self, code, info):
		Exception.__init__(self, "%s: %s" % (code, info))
		self.code = code
		self.info = info

class MW:
	
	def __init__(self, url):
		self.api = MWAPI(url)
		self.users = Users(self.api)
		self.pages = Pages(self.api)

class MWAPI:
	
	def __init__(self, url):
		self.url = url
	
	def post(self, params, cookies=None):
		params['format'] = "json"
		
		try:
			r = requests.post(
				self.url,
				params,
				cookies=cookies
			)
		except requests.ConnectionError as e:
			raise ConnectionError("Could not reach the API at %s: %s" % (self.url, e))
		except requests.HTTPError as e:
			raise MWAPIError('http', HTTPError)
		
		try:
			doc = json.loads(r.content)
		except ValueError as e:
			raise MWAPIError('value', "Could not decode json.")
		
		if 'error' in doc:
			raise MWAPIError(doc['error'].get('code'), doc['error'].get('info'))
		
		return doc, r.cookies
		

class Users:
	
	def __init__(self, api):
		self.api = api
	
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
		
	
class Pages:
	
	def __init__(self, api):
		self.api = api
	
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
			raise MWAPIError('format', "API response has unexpected structure.")
		except IndexError as e:
			raise MWAPIError('format', "API response has unexpected structure.")
		
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
				raise MWAPIError('format', "API response has unexpected structure %s" % doc)
		except KeyError as e:
			raise MWAPIError('format', "API response has unexpected structure %s" % doc)
	
	def append(self, page_name, markup, cookies=None):
		doc, cookies = self.api.post(
			{
				'action': "query",
				'prop': "info|revisions",
				'titles': page_name,
				'intoken': "edit"
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
		
