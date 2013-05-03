from mediawiki import templates, parsing

class Topic(DataType):
	def __init__(self, title, classes=None):
		self.title = unicode(title)
		self.classes = list(classes) if classes != None else None
	
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
	
	def deflate(self):
		return {
			'last_id': self.last_id,
			'topics':  [t.deflate() for t in self.topics]
		}
	
	@staticmethod
	def inflate(doc):
		return Talk(
			doc['last_id'],
			[Topic.inflate(t_doc) for t_doc in doc['topics']]
		)
	
	@staticmethod
	def from_markup(rev_id, markup):
		topics = []
		for title, section_markup in parsing.sections(markup):
			topics.append(
				Topic(
					parsing.clean_header(title), 
					templates.classes(section_markup)
				)
			)
		
		return Talk(rev_id, topics)

