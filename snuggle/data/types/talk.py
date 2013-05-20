from snuggle.mediawiki import templates, parsing

from . import serializable

class Thread(serializable.Type):
	def __init__(self, title, classes=None):
		self.title = unicode(title)
		self.classes = list(classes) if classes != None else None

class Talk(serializable.Type):
	
	def __init__(self, last_id=0, threads=None):
		self.last_id = int(last_id)
		if threads != None:
			self.threads = serializable.List.deserialize(Thread, threads)
		else:
			self.threads = serializable.List()
		
	def update(self, rev_id, markup):
		self.last_id = rev_id if rev_id != None else 0
		self.threads = serializable.List()
		for title, section_markup in parsing.sections(markup):
			self.threads.append(
				Thread(
					parsing.clean_header(title), 
					templates.classes(section_markup)
				)
			)

