from snuggle import errors
from snuggle.util import timestamp_to_string

from .api_subset import APISubset

class RecentChanges(APISubset):
	
	def read(self, last_id=None, last_timestamp=None, rccontinue=None, limit=500):
		params = {
			'action': "query",
			'list': "recentchanges",
			'rctype': "edit|log|new",
			'rcprop': "ids|timestamp|user|userid|loginfo",
			'rcdir': "newer",
			'rclimit': limit
		}
		if rccontinue != None:
			params['rccontinue'] = rccontinue
		elif last_timestamp != None and last_id != None:
			params['rccontinue'] = "%s|%s" % (
				timestamp_to_string(last_timestamp),
				last_id
			)
		elif last_timestamp != None:
			params['rcstart'] = timestamp_to_string(last_timestamp)
		
		doc, cookies = self.api.post(params)
		
		try:
			if 'query-continue' in doc:
				rccontinue = doc['query-continue']['recentchanges']['rccontinue']
			else:
				rccontinue = None
			
			return (
				rccontinue,
				doc['query']['recentchanges']
			)
		except KeyError as e:
			raise errors.MWAPIError('format', "API response has unexpected structure: %s" % doc)
