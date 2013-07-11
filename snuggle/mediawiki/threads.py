import re, copy

from snuggle.data import types
from .util import parsing, templates

class TraceExtractor(object):
	
	def __init__(self, name, expression, groups):
		self.name       = name
		self.expression = expression
		self.groups     = list(groups)
		
		assert len(self.groups) == self.expression.groups
		
	def extract(self, markup):
		
		matches = list(self.expression.finditer(markup))
		if len(matches) == 0:
			return None
		else:
			# Get the last match
			match = matches[-1]
			
			modifications = {}
			
			# Complete actions for all matched groups.
			for modification, group in zip(self.groups, match.groups()):
				if group != None:
					formatting = {
						'group': group
					}
					for key in modification:
						modifications[key] = modification[key] % formatting
				
			return types.Trace(self.name, modifications)
		
	@classmethod
	def from_doc(cls, name, doc):
		return TraceExtractor(
			name,
			re.compile(doc['expression'], re.I),
			doc['groups']
		)
	

class Parser(object):
	
	def __init__(self, extractors):
		self.extractors = list(extractors)
	
	def parse(self, markup):
		for title, markup in parsing.sections(markup):
			# Init trace
			icon = None 
			
			# Look for the first trace that matches
			for extractor in self.extractors:
				trace = extractor.extract(markup)
				if trace != None: break
			
			# Append thread
			yield types.Thread(title, trace)
			
	
	@classmethod
	def from_config(cls, config):
		return cls(
			TraceExtractor.from_doc(name, config.mediawiki['talk_threads']['traces'][name])
			for name in config.mediawiki['talk_threads']['priority']
		)