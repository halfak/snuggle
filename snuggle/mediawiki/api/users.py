from snuggle import errors

from .api_subset import APISubset

class Users(APISubset):
	
	"""
	def authenticate(self, username, password):
		doc, cookies  = self.api.post(
			{
				'action': "login",
				'lgname': username,
				'lgpassword': password
			}
		)
		
		doc, cookies = self.api.post(
			{
				'action': "login",
				'lgname': username,
				'lgpassword': password,
				'lgtoken': doc['login']['token']
			},
			cookies = cookies
		)
		
		try:
			if doc['login']['result'] == "WrongPass":
				raise errors.AuthErrorPass()
			elif doc['login']['result'] == "NotExists":
				raise errors.AuthErrorName()
			elif doc['login']['result'] == "Success":
				return (
					doc['login']['lguserid'], #id 
					doc['login']['lgusername'], #name
					cookies #cookies
				)
			else:
				raise Exception("Unexpected login result: %s" % doc['login']['result'])
		except KeyError as e:
			raise errors.MWAPIError('format', "API response has unexpected structure: %s" % doc)
	"""
	
	def info(self, access_token):
		doc = self.api.post(
			{
				'action': 'query', 
				'meta': 'userinfo'
			},
			access_token=access_token
		)
		
		try:
			return (
				doc['query']['userinfo']['id'],
				doc['query']['userinfo']['name']
			)
		except KeyError as e:
			raise errors.MWAPIError('format', "API response has unexpected structure: %s" % doc)
			
	
