from snuggle.errors import InvalidAction
from snuggle.data import types

from .api import API

class UserActions:
	
	def __init__(self, actions):
		self.actions = actions
	
	
	def perform(self, request, snuggler=None):
		if request.action_name not in self.actions:
			raise InvalidAction(request.type)
		else:
			return self.actions[request.action_name].perform(request, snuggler)
		
	def preview(self, request, snuggler=None):
		if request.action_name not in self.actions:
			raise InvalidAction(request.action_name)
		else:
			return self.actions[request.action_name].preview(request, snuggler)
	
	@classmethod
	def from_config(cls, config):
		api = API.from_config(config)
		actions = {}
		for doc in config.mediawiki['user_actions']:
			action = Action.from_doc(doc, api)
			actions[action.name] = action
		
		return cls(actions)


class Action:
	'''
	A collection of wiki operations that represent one "Action".
	'''
	def __init__(self, name, operations):
		self.name       = unicode(name)
		self.operations = operations
	
	def perform(self, request, snuggler):
		return [operation.save(request, snuggler) for operation in self.operations]
		
	def preview(self, request, snuggler):
		return [operation.preview(request, snuggler) for operation in self.operations]
			
	@classmethod
	def from_doc(cls, doc, api):
		return cls(
			doc['name'],
			[Operation.from_doc(d, api) for d in doc['operations']]
		)


class Operation:
	TYPES = {}
	
	def __init__(self, api):
		self.api = api
	
	def _vals(self, request, snuggler=None):
		doc = dict(request.fields)
		doc.update({
				'user_id': request.user.id,
				'user_name': request.user.name,
				'snuggler_id': snuggler.id if snuggler != None else None,
				'snuggler_name': snuggler.name if snuggler != None else None
		})
		return doc
	
	@classmethod
	def from_doc(cls, doc, api):
		Class = cls.TYPES[doc['type']]
		return Class.from_doc(doc, api)

class Edit(Operation):
	
	def __init__(self, api, page_name, markup="", comment=""):
		Operation.__init__(self, api)
		
		self.page_name = unicode(page_name)
		self.markup    = unicode(markup)
		self.comment   = unicode(comment)
	
	def _eval_params(self, request, snuggler=None):
		vals = self._vals(request, snuggler)
		return (
			self.page_name % vals,
			self.markup % vals,
			self.comment % vals
		)
	
	def save(self, request, snuggler):
		raise NotImplementedError()
	
	def preview(self, request, snuggler=None):
		page_name, markup, comment = self._eval_params(request, snuggler)
		
		page_name, html, comment = self.api.pages.preview(
			markup=markup,
			page_name=page_name,
			comment=comment,
			cookies=snuggler.cookies if snuggler != None else None
		)
		return types.EditPreview(html, page_name, comment)
	
	@classmethod
	def from_doc(cls, doc, api):
		return cls(
			api,
			doc['page_name'],
			doc['markup'],
			doc['comment']
		)

class Replace(Edit):
	TYPE = "replace"
	
	def save(self, request, snuggler=None):
		page_name, markup, comment = self._eval_params(request, snuggler)
		
		page_name, rev_id = self.api.pages.replace(
			page_name=page_name,
			markup=markup,
			comment=comment,
			cookies=snuggler.cookies if snuggler != None else None
		)
		return types.EditResult(page_name, rev_id)

Operation.TYPES[Replace.TYPE] = Replace

class Append(Edit):
	TYPE = "append"
	
	def save(self, request, snuggler=None):
		page_name, markup, comment = self._eval_params(request, snuggler)
		
		page_name, rev_id = self.api.pages.append(
			page_name=page_name,
			markup=markup,
			comment=comment,
			cookies=snuggler.cookies if snuggler != None else None
		)
		return types.EditResult(rev_id, page_name)

Operation.TYPES[Append.TYPE] = Append

class Watch(Operation):
	TYPE = "watch"
	
	def __init__(self, api, page_name):
		self.page_name = page_name
	
	def preview(self, request, snuggler):
		page_name = self.page_name % self._vals(request, snuggler)
		return types.WatchPreview(page_name)
		
	
	def save(self, request, snuggler):
		page_name = self.page_name % self._vals(request, snuggler)
		self.api.pages.watch(
			page_name=page_name,
			cookies=snuggler.cookies
		)
		return types.WatchResult(page_name)
	
	
	@classmethod
	def from_doc(cls, doc, api):
		return cls(
			api,
			doc['page_name']
		)
	
Operation.TYPES[Watch.TYPE] = Watch

