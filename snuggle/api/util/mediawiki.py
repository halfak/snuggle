import requests, json

class AuthErrorPass(Exception): pass
class AuthErrorName(Exception): pass

HTTPError = requests.HTTPError

class MW:
	
	def __init__(self, url):
		self.url = url
		self.users = Users(url)
		self.pages = Pages(url)
	

class ConnectionError(Exception); pass
class MWAPIError(Exception):
	
	def __init__(self, code, info)
		Exception.__init__(self, "%s: %s" % (code, info))
		self.code = code
		self.info = info
		


class MWAPI:
	
	def __init__(self, url):
		self.url = url
	
	def post(self, params):
		params['format'] = "json"
		
		try:
			r = requests.post(
				self.url,
				params
			)
		except requests.ConnectionError as e:
			raise MWAPIError("Could not reach the API at %s: %s" % (self.url, e))
		except requests.HTTPError as e:
			raise MWAPIError("The API responded with an error."
		
		

class Users:
	
	def __init__(self, url):
		self.url = url
	
	def authenticate(self, username, password):
		r = requests.post(
			self.url,
			params={
				'action': "login",
				'lgname': username,
				'lgpassword': password,
				'format': "json"
			}
		)
		response_doc = json.loads(r.content)
		
		r = requests.post(
			self.url,
			params={
				'action': "login",
				'lgname': username,
				'lgpassword': password,
				'lgtoken': response_doc['login']['token'],
				'format': "json"
			},
			cookies = r.cookies
		)
		
		response_doc = json.loads(r.content)
		
		if response_doc['login']['result'] == "WrongPass":
			raise AuthErrorPass()
		elif response_doc['login']['result'] == "NotExists":
			raise AuthErrorName()
		elif response_doc['login']['result'] == "Success":
			return (
				response_doc['login']['lguserid'], #id 
				response_doc['login']['lgusername'], #name
				r.cookies #cookie
			)
		else:
			raise Exception("no")
		
	
class Pages:
	
	def init(self, url):
		self.url = url
	
	def append(self, page_name, markup, cookies=None):
		
		r = requests.post(
			self.url,
			params={
				'action': "query",
				'prop': "info|revisions",
				'titles': page_name,
				'intoken': "edit"
			},
			cookies = cookies
		)
		response_doc = json.loads(r.content)
		
		token = response_doc['query']
		
		r = requests.post(
			self.url,
			params={
				'action': "edit",
				'appendtext': "\n\n" + markup
				'token': 
				'format': "json"
			},
			cookies = r.cookies
		)
		response_doc = json.loads(r.content)
