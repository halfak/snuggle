import re

from snuggle.data import types
from snuggle.mediawiki import parsing, templates

tokenizer = parsing.Tokenizer(parsing.TOKENS)
templates = templates.Templates(templates.TEMPLATES)

class Talks:
	
	def __init__(self, db):
		self.db  = db
	
	def __contains__(self, title):
		name = types.User.normalize(title)
		return self.db.users.find_one({'name': name}, {'_id': 1}) != None
	
	def get(self, title):
		name = types.User.normalize(title)
		doc = self.db.users.find_one({'name': name})
		
		if doc == None:
			raise KeyError(title)
		else:
			return Talk(self.db, doc['_id'], doc.get('talk', {}).get('rev_id', 0))
		


class Talk:
	
	def __init__(self, db, id, last_id):
		self.db = db
		self.id = int(id)
		self.last_id = int(last_id)
	
	
	def update(self, revId, markup):
		topics  = []
		
		for title, body in parsing.sections(markup):
			display = "".join(t.display() for t in tokenizer.tokenize(title))
			
			
			
			topics.append({
				'title': display,
				'classes': templates.classes(body)
			})
		
		self.db.users.update(
			{'_id': self.id},
			{'$set': {
				'talk':{
					'rev_id': revId,
					'topics': topics
				}
			}},
			safe=True
		)
	
