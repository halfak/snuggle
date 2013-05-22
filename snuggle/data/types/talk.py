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

