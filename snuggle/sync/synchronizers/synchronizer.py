import threading


class Synchronizer(threading.Thread):
	
	def __init__(self):
		threading.Thread.__init__(self)
	
	def run(self):
		raise NotImplementedError()
	
	def stop(self):
		raise NotImplementedError()
	
	def status(self):
		raise NotImplementedError()
		
	
