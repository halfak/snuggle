import requests

class NoScore(Exception): pass

class API:
	
	NoScore = NoScore
	
	def __init__(self, uri, headers):
		self.uri = uri
		self.headers = headers
	
	def lookup(self, rev_id):
		rev_id = int(rev_id)
		
		response = requests.get(
			self.uri,
			params={
				"style": "score",
				"rid": rev_id
			},
			headers=self.headers
		)
		
		if response.content.strip() == "":
			raise NoScore
		
		return float(response.content)
	
	@staticmethod
	def from_config(doc, section):
		
		return API(
			doc[section]['uri'], 
			headers=doc[section]['headers']
		)
