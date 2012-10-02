import re

from mediawiki import parsing, templates
from data import types

MARKUP_HEADER_RE = re.compile(r"(^|\n)==([^=]+)==")

tokenizer = parsing.Tokenizer(parsing.TOKENS)
templates = templates.Templates(templates.TEMPLATES)

class Talks:
	
	def __init__(self, db):
		self.db  = db
	
	def __contains__(self, title):
		name = types.User.normalize(title)
		return self.db.users.find({'name': name}, {'_id': 1}).count() > 0
	
	def get(self, title):
		name = types.User.normalize(title)
		json = self.db.users.find_one({'name': name})
		
		if json == None:
			raise KeyError(title)
		else:
			return Talk(self.db, json['_id'], json.get('talk', {}).get('rev_id', 0))


class Talk:
	
	def __init__(self, db, id, lastId):
		self.db = db
		self.id = id
		self.lastId = lastId
	
	
	def update(self, revId, markup):
		topics  = []
		
		for title, body in self.sections(markup):
			display = "".join(t.display() for t in tokenizer.tokenize(title))
			
			topics.append({
				'title': display,
				'classes': [t.className() for t in templates.find(body)]
			})
		
		self.db.users.update(
			{'_id': self.id},
			{'$set': {
				'talk':{
					'rev_id': revId,
					'topics': topics
				}
			}}
		)
	
	@staticmethod
	def sections(markup):
		matches = list(MARKUP_HEADER_RE.finditer(markup))
		for i, match in enumerate(matches):
			if (i+1) < len(matches): next = matches[i+1].start()
			else:                    next = len(markup)
			
			yield match.group(2).strip(), markup[match.end():next]
