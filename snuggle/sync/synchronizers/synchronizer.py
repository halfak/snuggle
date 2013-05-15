import threading


class Synchronizer(threading.Thread):
	
	NAME = NotImplemented
	
	def __init__(self):
		threading.Thread.__init__(self)
		
		# This makes sure that the thread shuts down when the main process does
		self.daemon = True
	
	def run(self):
		raise NotImplementedError()
	
	def stop(self):
		raise NotImplementedError()
	
	def status(self):
		raise NotImplementedError()
		
	
