import requests, json

class AuthErrorPass(Exception): pass
class AuthErrorName(Exception): pass

HTTPError = requests.HTTPError

class MW:
	
	def __init__(self, url):
		self.url = url
		self.users = Users(url)
	

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
		
