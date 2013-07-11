from . import serializable

class Trace(serializable.Type):
	def __init__(self, name, modifications=None):
		self.name = name
		self.modifications = modifications if modifications != None else {}

class Thread(serializable.Type):
	def __init__(self, title, trace=None):
		self.title = unicode(title)
		self.trace = Trace.deserialize(trace) if trace != None else None

class Talk(serializable.Type):
	
	def __init__(self, last_id=0, threads=None):
		self.last_id = int(last_id)
		if threads != None:
			self.threads = serializable.List.deserialize(Thread, threads)
		else:
			self.threads = serializable.List()

