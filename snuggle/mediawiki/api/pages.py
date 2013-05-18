from .api_subset import APISubset
from .errors import MWAPIError

class Pages(APISubset):
	
	def _get_edit_token(self, page_name, cookies=None):
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
			raise MWAPIError('format', "API response has unexpected structure: %s" % doc)
		except IndexError as e:
			raise MWAPIError('format', "API response has unexpected structure: %s" % doc)
			
		return page['edittoken']
	
	def append(self, page_name, markup, cookies=None, comment=""):
		edit_token = self._get_edit_token(page_name, cookies=None)
		
		doc, cookies = self.api.post(
			{
				'action': "edit",
				'title': page_name,
				'appendtext': "\n\n" + markup,
				'token': edit_token,
				'summary': comment,
				'format': "json"
			},
			cookies = cookies
		)
		
		try:
			if doc['edit']['result'] == "Success":
				return doc['edit']['title'], doc['edit']['newrevid']
			else:
				raise MWAPIError(doc['edit']['result'], str(doc['edit']))
		except KeyError as e:
			raise MWAPIError('format', "API response has unexpected structure: %s" % doc)
	
	def replace(self, page_name, markup, cookies=None, comment=""):
		edit_token = self._get_edit_token(page_name, cookies=None)
		
		doc, cookies = self.api.post(
			{
				'action': "edit",
				'title': page_name,
				'text': "\n\n" + markup,
				'token': edit_token,
				'summary': comment,
				'format': "json"
			},
			cookies = cookies
		)
		
		try:
			if doc['edit']['result'] == "Success":
				return doc['edit']['title'], doc['edit']['newrevid']
			else:
				raise MWAPIError(doc['edit']['result'], str(doc['edit']))
		except KeyError as e:
			raise MWAPIError('format', "API response has unexpected structure: %s" % doc)
	
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
			comment = doc['parse'].get('parsedsummary', {}).get('*', None)
		except KeyError as e:
			raise MWAPIError('format', "API response has unexpected structure: %s" % doc)
		except IndexError as e:
			raise MWAPIError('format', "API response has unexpected structure: %s" % doc)
		
		return html, comment
		
	
	def watch(self, page_name, cookies=None):
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
	
	def history(self, page_id, rev_id, n, cookies=None):
		doc, cookies = self.api.post(
			{
				'action': "query",
				'prop': "revisions",
				'pageids': page_id,
				'rvdir': "older",
				'rvstartid': rev_id-1,
				'rvprop': "ids|sha1"
			}
		)
		
		try:
			page = doc['query']['pages'].values()[0]
		except KeyError as e:
			raise MWAPIError('format', "API response has unexpected structure: %s" % doc)
		except IndexError as e:
			raise MWAPIError('format', "API response has unexpected structure: %s" % doc)
		
		return page.get('revisions', [])