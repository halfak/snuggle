from .api_subset import APISubset
from .errors import MWAPIError, AuthErrorPass, AuthErrorName
		
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
		
		try:
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
		except KeyError as e:
			raise MWAPIError('format', "API response has unexpected structure: %s" % doc)