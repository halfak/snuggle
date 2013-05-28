import yaml, json

class Configuration(dict):
	
	def __init__(self, doc=None,):
		dict.__init__(
			self, 
			doc if doc != None else {}
		)
	
	def load_yaml(self, f):
		return self.load(yaml.load(f))
	
	def load_json(self, f):
		if hasattr(f, "read"):
			return self.load(json.load(f))
		elif hasattr(f, "__len__"):
			return self.load(json.loads(f))
		
	def load(self, doc):
		dict.update(self, doc)
		
	

#Singletons.  These should be referenced from here. 
snuggle = Configuration()
mediawiki = Configuration()
i18n = Configuration()

