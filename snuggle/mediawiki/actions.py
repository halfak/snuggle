
class Edit:
	TYPES = {}
	
	def __init__(self, api, page_name, markup="", comment=""):
		self.api = api
		
		self.page_name = unicode(page_name)
		self.markup    = unicode(markup)
		self.comment   = unicode(comment)
	
	def _page_name(self, fields, user):
		return self.page_name % self._vals(user, fields)
	
	def _markup(self, fields, user):
		return self.markup % self._vals(user, fields)
	
	def _comment(self, fields, user):
		return self.comment % self._vals(user, fields)
	
	def _vals(self, fields, user):
		vals = {
			'user_id': user.id,
			'user_name': user.name,
		}
		vals.update(fields)
		return vals
	
	def save(self, fields, user, cookies=None):
		raise NotImplementedError()
	
	def preview(self, fields, user, cookies=None):
		page_name = self._page_name(fields, user)
		comment = self._comment(fields, user)
		html, comment = self.api.pages.preview(
			self._markup(fields, user),
			page_name=page_name,
			comment=comment,
			cookies=cookies
		)
		return html, page_name, comment
	
	def from_config(config, doc):
		return self.TYPES[doc['type']].from_config(doc)

class Replace(Edit):
	TYPE = "replace"
	
	def save(self, fields, user, cookies=None):
		return self.api.pages.replace(
			self._title(fields, user),
			self._markup(fields, user),
			self._comment(fields, user),
			cookies
		)
	
	def from_config(doc):
		return Replace(doc['title'], doc['markup'], doc['comment'])

Edit.TYPES[Replace.TYPE] = Replace

class Append(Edit):
	TYPE = "append"
	
	def save(self, fields, user, cookies=None):
		return self.api.pages.append(
			self._title(fields, user),
			self._markup(fields, user),
			self._comment(fields, user),
			cookies
		)
	
	def from_config(doc):
		return Append(doc['title'], doc['markup'], doc['comment'])

Edit.TYPES[Append.TYPE] = Append
	
class Actor:
	
	def __init__(self, api):
		self.api = api
		self.actions = {}
		
	def register(self, name, edits):
		assert name not in self.actions
		
		self.actions[name] = edits
	
	def preview(self, name, fields, user, cookies=None):
		for edit in self.actions[name]:
			yield edit.TYPE, html, page_name, comment = edit.preview(fields, user, cookies)
	
	def act(self, name, fields, user, cookies=None):
		for edit in self.actions[name]:
			yield rev_id, page_id, page_name = edit.save(fields, user, cookies)
	
	
################################################################################
# Let's pretend
#
# action = Action.from_doc(doc)
# page_name, html, comment = Actor.preview(action)

