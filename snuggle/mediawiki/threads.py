import re, copy

from snuggle.data import types
from .util import parsing, templates

def parse(markup):
	threads = []
	for title, section_markup in parsing.sections(markup):
		threads.append(
			types.Thread(
				parsing.clean_header(title), 
				templates.classes(section_markup)
			)
		)
	return threads


class Matcher(object):
	
	def __init__(self, expression, groups, icon):
		self.expression = expression
		self.groups     = list(groups)
		self.icon       = icon
		
		assert len(self.groups) == self.expression.groups
		
	def match(self, markup):
		
		matches = list(self.expression.finditer(markup))
		if len(matches) == 0:
			return None
		else:
			# Get the last match
			match = matches[-1]
			
			# Shallow copy of the icon dict
			icon = copy.deepcopy(self.icon)
			
			# Complete actions for all matched groups.
			for action, group in zip(self.groups, match.groups()):
				if group != None:
					formatting = {
						'group': group
					}
					for key in action:
						icon[key] = action[key] % formatting
				
			return icon
		
	@classmethod
	def from_doc(cls, doc):
		return TraceMatcher(
			re.compile(doc['expression'], re.I),
			doc['groups'],
			doc['icon']
		)
	

class Threads:
	
	def __init__(self, matchers):
		self.matchers = list(matchers)
	
	def parse(markup):
		for title, markup in parsing.sections(markup):
			# Init trace
			icon = None 
			
			# Look for the first trace that matches
			for matcher in self.matchers:
				icon = matcher.match(markup)
				if icon != None: break
			
			# Append thread
			yield Thread(title, icon)
			
	
	@classmethod
	def from_config(cls, config):
		return Threads(
			Matcher.from_doc(config['talk_threads']['traces'][name])
			for name in config['talk_threads']['priority']
		)