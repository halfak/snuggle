from . import serializable
from .revision import UserRevision

class Activity(serializable.Type):
	
	def __init__(self, reverted=0, self_reverted=0, revisions=None, counts=None):
		self.reverted = int(reverted)
		self.self_reverted = int(self_reverted)
		if revisions != None:
			self.revisions = serializable.Dict.deserialize(UserRevision, revisions)
		else:
			self.revisions = serializable.Dict()
		
		self.counts = counts if revisions != None else {}
