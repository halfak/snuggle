from snuggle import errors
from snuggle.util import timestamp_to_string

from .api_subset import APISubset

class Revisions(APISubset):
	
	def search(self, ids):
		
		while len(ids) > 0:
			current_ids = ids[:50]
			ids = ids[50:]
			
			doc, cookies = self.api.post(
				{
					'action': "query",
					'prop': "revisions",
					'revids': "|".join(str(id) for id in current_ids),
					'rvprop': "ids|timestamp|user|userid|size|comment|sha1",
				}
			)
			try:
				for page_doc in doc['query']['pages'].values():
					for rev_doc in page_doc['revisions']:
						rev_doc['pageid'] = page_doc['pageid']
						rev_doc['title'] = page_doc['title']
						rev_doc['ns'] = page_doc['ns']
						yield rev_doc
			except KeyError:
				raise errors.MWAPIError('format', "API response has unexpected structure: %s" % doc)
			
		
