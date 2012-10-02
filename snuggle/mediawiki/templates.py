import re

class Template:
	expression = NotImplemented
	groups     = NotImplemented
	
	def __init__(self, match, group): pass


class VandalWarning(Template):
	expression = r'uw-vandalism([1-4])(im)?'
	groups     = 2
	
	def __init__(self, match, offset):
		self.level = int(match.group(offset+1))
		self.immediate = match.group(offset+2) != None
	
	def className(self):
		return "%s-%s%s" % (
			self.__class__.__name__, 
			self.level, 
			"im" if self.immediate else ""
		)

class SpanWarning(Template):
	expression = r'uw-spam([1-4])(im)?'
	groups     = 2
	
	def __init__(self, match, offset):
		self.level = int(match.group(offset+1))
		self.immediate = match.group(offset+2) != None
	
	def className(self):
		return "%s-%s%s" % (
			self.__class__.__name__, 
			self.level, 
			"im" if self.immediate else ""
		)
	

class CopyrightWarning(Template):
	expression = r'uw-copyright(-([a-z]+))?'
	groups     = 2
	
	def __init__(self, match, offset):
		self.type = match.group(offset+2) != None
	
	def className(self): return self.__class__.__name__

class MultiLevelWarning(Template):
	expression = r'uw-[a-z]+([1-4])(im)?'
	groups     = 2
	
	def __init__(self, match, offset):
		self.level = int(match.group(offset+1))
		self.immediate = match.group(offset+2) != None
	
	def className(self):
		return "%s-%s%s" % (
			self.__class__.__name__, 
			self.level, 
			"im" if self.immediate else ""
		)

class OtherWarning(Template):
	expression = r'uw-.+?'
	groups     = 0
	
	def className(self): return self.__class__.__name__
	
class Block(Template):
	expression = r'.*block|uw-[a-z]*block[a-z]*'
	groups     = 0
	
	def className(self): return self.__class__.__name__
	
class Welcome(Template):
	expression = r'w-[a-z]+|welcome'
	groups     = 0
	
	def className(self): return self.__class__.__name__

class Deletion(Template):
	expression = r'csd|db-|speedy|delet(e|tion)'
	groups     = 1
	
	def className(self): return self.__class__.__name__
	

TEMPLATES = [
	VandalWarning,
	SpanWarning,
	CopyrightWarning,
	MultiLevelWarning,
	OtherWarning,
	Block,
	Welcome,
	Deletion
]

class Templates:
	
	def __init__(self, templates):
		self.re = re.compile(
			"|".join(
				"Template:(%s)" % t.expression
				for t in templates
			),
			re.I
		)
		
		self.templateMap = {}
		offset = 1
		for template in templates:
			self.templateMap[offset] = (template, offset)
			offset += template.groups + 1
		
	def find(self, markup):
		for match in self.re.finditer(markup):
			template, offset = self.templateMap[match.lastindex]
			
			yield template(match, offset)
