import requests


class API:
	
	def __init__(self, uri, headers=None):
		self.uri = uri
		self.headers = headers if headers != None else {}
	
	def getMarkup(self, revId=None, pageId=None, title=None):
		
		if revId != None:
			data = {
				'revids': revId
			}
		elif pageId != None:
			data = {
				'pageids': pageId
			}
		elif title != None:
			data = {
				'titles': title
			}
		else:
			raise ValueError("Must specify revId, pageId or title.")
		
		data.update({
			'action': "query",
			'prop':   "revisions",
			'rvprop': "ids|content",
			'rvpst': 1,
			'format': "json"
		})
		r = requests.post(self.uri, params=data, headers=self.headers)
		
		page = r.json['query']['pages'].values()[0]
		
		if "missing" in page:
			return None, ''
		else:
			if len(page['revisions']) > 0:
				revision = page['revisions'][0]
				return revision.get('revid'), revision.get('*', "")
			else:
				return None, ''
			
		
	
	@staticmethod
	def fromConfig(config, section):
		headers = {}
		for key, value in config.items(section):
			if key not in ("uri", "module"):
				headers[key] = value
				
			
		
		return API(config.get(section, "uri"), headers=headers)
