import re

class Token:
	
	def __init__(self, match, offset):pass
	
	def type(self):
		return self.__class__.__name__

class InternalLink:
	expression = r'(\[\[([^\]]+?)(\|([^]]+))?\]\])'
	groups = 4
	
	def __init__(self, match, offset):
		self.title = match.group(2).strip()
		if match.group(3) != None:
			self.displayText = match.group(4)
		else:
			self.displayText = self.title
	
	def display(self):
		return self.displayText

class ExternalLink:
	expression = r'(\[((mailto:|https?://)[^ \]]+)( ([^]]+))?\])'
	groups = 5
	
	def __init__(self, match, offset):
		self.href = match.group(offset+3)
		if match.group(offset+5) != None:
			self.displayText = match.group(offset+5)
		else:
			self.displayText = '[1]' #this is a guess -- and a bad one.
	
	def display(self):
		return self.displayText

class TextPlain:
	expression = r'([\w0-9 \t\n\r,.?!\-_\\/]+)'
	groups = 1
	
	def __init__(self, match, offset):
		self.text = match.group(offset+1)
	
	def display(self):
		return self.text

class SpecialChar:
	expression = r'(.)'
	groups = 1
	
	def __init__(self, match, offset):
		self.text = match.group(offset+1)
	
	def display(self):
		return self.text

TOKENS = [
	InternalLink,
	ExternalLink,
	TextPlain,
	SpecialChar
]

class Tokenizer:
	
	def __init__(self, tokens):
		self.re = re.compile("|".join(token.expression for token in tokens))
		
		self.tokenMap = {}
		offset = 1
		for token in tokens:
			self.tokenMap[offset] = (token, offset)
			offset += token.groups
	
	def tokenize(self, markup):
		scan = self.re.scanner(markup)
		
		while 1:
			match = scan.match()
			if match == None: break
			else:
				Token, offset = self.tokenMap[match.lastindex]
				yield Token(match, offset-1)
