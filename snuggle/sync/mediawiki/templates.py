import re, heapq

#One liner to create a heap class
Heap = type("Heap", (list,), {item: (lambda item2: (lambda self, *args: getattr(heapq, "heap" + item2)(self, *args)))(item)  for item in ("pop", "push", "pushpop", "replace")})

class Template:
	expression = NotImplemented
	groups     = NotImplemented
	
	def __init__(self, match, group): pass


class VandalWarning(Template):
	expression = r'uw-vandalism([1-4])?(im)?'
	groups     = 2
	priority   = 1
	
	def __init__(self, match, offset):
		self.level     = match.group(offset+1)
		self.immediate = match.group(offset+2) != None
	
	def classes(self):
		return [
			"warning",
			"vandal"
		] + (["level_" + self.level] if self.level else [])

class SpamWarning(Template):
	expression = r'uw-spam([1-4])?(im)?'
	groups     = 2
	priority   = 1
	
	def __init__(self, match, offset):
		self.level     = match.group(offset+1)
		self.immediate = match.group(offset+2) != None
	
	def classes(self):
		return [
			"warning",
			"spam"
		] + (["level_" + self.level] if self.level else [])
	

class CopyrightWarning(Template):
	expression = r'uw-copyright(-([a-z]+))?([1-4])?'
	groups     = 3
	priority   = 1
	
	def __init__(self, match, offset):
		self.type  = match.group(offset+1) != None
		self.level = match.group(offset+2)
	
	def classes(self): 
		return [
			"warning",
			"copyright"
		] + (["level_" + self.level] if self.level else [])
	
class Block(Template):
	expression = r'.*?block.*?|uw-[a-z]*block[a-z]*'
	groups     = 0
	priority   = 0
	
	def classes(self): return ["block"]
	

class GeneralWarning(Template):
	expression = r'uw-.+?([1-4])?(im)?'
	groups     = 2
	priority   = 2
	
	def __init__(self, match, offset):
		self.level     = match.group(offset+1)
		self.immediate = match.group(offset+2) != None
	
	def classes(self): 
		return [
			"warning",
		] + (["level_" + self.level] if self.level else [])
	
class Welcome(Template):
	expression = r'w-[a-z]+|welcome|First article'
	groups     = 0
	priority   = 3
	
	def classes(self): return ["welcome"]

class CSD(Template):
	expression = r'.*?csd|db-|speedy.*?'
	groups     = 0
	priority   = 0
	
	def classes(self): return ["csd"]
	

class Deletion(Template):
	expression = r'prod|afd|.*?delet.*?'
	groups     = 1
	priority   = 1
	
	def classes(self): return ["deletion"]
	
TEMPLATES = [
	VandalWarning,
	SpamWarning,
	CopyrightWarning,
	Block,
	GeneralWarning,
	Welcome,
	CSD,
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
		
	def classes(self, markup):
		
		t = self.find(markup)
		if t: return t.classes()
		else: return [] 
	
	def find(self, markup):
		h = Heap()
		for t in self.search(markup):
			h.push((t.priority, t))
		
		try:
			prority, t = h.pop()
			return t
		except IndexError:
			return None
		
	def search(self, markup):
		for match in self.re.finditer(markup):
			template, offset = self.templateMap[match.lastindex]
			yield template(match, offset)
		
