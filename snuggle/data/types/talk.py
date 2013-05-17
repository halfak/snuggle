from snuggle.mediawiki import templates, parsing

from .data_type import DataType

class Topic(DataType):
	def __init__(self, title, classes=None):
		self.title = unicode(title)
		self.classes = list(classes) if classes != None else None
	
	def __eq__(self, other):
		try:
			return (
				self.title == other.title and
				self.classes == other.classes
			)
		except AttributeError:
			return False
	
	def deflate(self):
		return {
			'title': self.title,
			'classes': self.classes
		}
	
	@staticmethod
	def inflate(doc):
		return Topic(
			doc['title'],
			doc['classes']
		)

class Talk(DataType):
	
	def __init__(self, last_id=0, topics=None):
		self.last_id = int(last_id)
		self.topics = list(topics) if topics != None else []
	
	def __eq__(self, other):
		try:
			return (
				self.last_id == other.last_id and
				self.topics == other.topics
			)
		except AttributeError:
			return False
	
	def deflate(self):
		return {
			'last_id': self.last_id,
			'topics':  [t.deflate() for t in self.topics]
		}
		
	def update(self, rev_id, markup):
		self.last_id = rev_id if rev_id != None else 0
		self.topics = []
		for title, section_markup in parsing.sections(markup):
			self.topics.append(
				Topic(
					parsing.clean_header(title), 
					templates.classes(section_markup)
				)
			)
	
	@staticmethod
	def inflate(doc):
		return Talk(
			doc['last_id'] if doc['last_id'] != None else 0,
			[Topic.inflate(t_doc) for t_doc in doc['topics']]
		)

