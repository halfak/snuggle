import sys, time

from snuggle import configuration
from snuggle import mediawiki
from snuggle.data import types
from snuggle.util import string_to_timestamp

class MWAPI:
	
	def __init__(self, api):
		self.api = api
		self.rccontinue = None
		self.last_rcid = 0
		self.last_timestamp = 0
	
	def set_position(self, last_rcid, last_timestamp):
		self.last_rcid = last_rcid,
		self.last_timestamp = last_timestamp
	
	def read(self, limit=None, types=None):
		rccontinue, change_docs = self.api.recent_changes.read(
			last_id=self.last_rcid, 
			last_timestamp=self.last_timestamp, 
			rccontinue=self.rccontinue,
			limit=limit,
			types=types
		)
		
		rev_ids = [doc['revid'] for doc in change_docs if 'revid' in doc and doc['revid'] != 0]
		rev_docs = dict(
			(doc['revid'], doc) 
			for doc in self.api.revisions.search(ids=rev_ids)
		)
		
		self.rccontinue = rccontinue
		
		return self._deserialize_changes(change_docs, rev_docs)
		
	
	def _deserialize_changes(self, change_docs, rev_docs):
		for doc in change_docs:
			if 'logtype' in doc:
				if (doc['logtype'], doc['logaction']) == ("newusers", "create"):
					yield types.Change(
						doc['rcid'],
						string_to_timestamp(doc['timestamp']),
						"new user",
						NewUser.from_doc(doc)
					)
				
			elif doc['revid'] != 0:
				if doc['revid'] in rev_docs:
					yield types.Change(
						doc['rcid'],
						string_to_timestamp(doc['timestamp']),
						"new revision",
						ChangeRevision.from_doc(rev_docs[doc['revid']])
					)
			
			
			self.last_rcid = doc['rcid']
			self.last_timestamp = string_to_timestamp(doc['timestamp'])
				
			
		
	
	def history(self, page_id, rev_id, n):
		rev_docs = list(self.api.pages.history(page_id, rev_id, n))
		
		history = {}
		for doc in reversed(rev_docs):
			# For some reason, we sometimes don't get a sha1.  Ignore those.
			if 'sha1' in doc: history[doc['sha1']] = int(doc['revid'])
		
		return history
	
	def __repr__(self):
		return "%s(%s)" % (self.__class__.__name__, repr(self.api))
	
	def __str__(self): return repr(self)
	
	@staticmethod
	def from_config(config):
		return MWAPI(
			mediawiki.API.from_config(config)
		)

class ChangeRevision(types.ChangeRevision):
	
	@staticmethod
	def from_doc(doc):
		
		return ChangeRevision(
			doc['revid'],
			User.from_doc(doc),
			Page.from_doc(doc),
			string_to_timestamp(doc['timestamp']),
			doc.get('comment', u""),
			ByteDiff.from_doc(doc),
			doc['sha1']
		)
	

class NewUser(types.NewUser):
	
	@staticmethod
	def from_doc(doc): return NewUser(
		doc['userid'], 
		doc['user'], 
		string_to_timestamp(doc['timestamp'])
	)

class User(types.User):
	
	@staticmethod
	def from_doc(doc): return User(doc['userid'], doc['user'])

class Page(types.Page):
	
	@staticmethod
	def from_doc(doc): 
		if doc['ns'] != 0:
			title = doc['title'].split(":", 1)[1]
		else:
			title = doc['title']
		
		return Page(doc['pageid'], title, doc['ns'])

class ByteDiff(types.ByteDiff):
	
	@staticmethod
	def from_doc(doc):
		return ByteDiff(doc['size'], None)


