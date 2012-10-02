class DataType:
	
	def deflate(self): raise NotImplementedError()
	
	@staticmethod
	def inflate(json): raise NotImplementedError()


class User(DataType):
	
	def __init__(self, id, name):
		self.id   = int(id)
		self.name = unicode(name)
	
	def deflate(self):
		return {
			'_id':   self.id,
			'name': self.name
		}
	
	@staticmethod
	def inflate(js):
		return User(
			js['_id'],
			js['name']
		)
	
	@staticmethod
	def normalize(title):
		return title.replace("_", " ").capitalize()
	


class NewUser(User):
	
	def __init__(self, id, name, registration):
		User.__init__(self, id, name)
		self.registration = int(registration)
	
	def deflate(self):
		json = User.deflate(self)
		json['registration'] = self.registration
		return json
	
	@staticmethod
	def inflate(json):
		return NewUser(
			json['_id'],
			json['name'],
			json['registration']
		)


class Page(DataType):
	
	def __init__(self, id, title, namespace):
		self.id        = int(id)
		self.title     = unicode(title)
		self.namespace = int(namespace)
	
	def deflate(self):
		return {
			'_id': self.id,
			'title': self.title,
			'namespace': self.namespace
		}
	
	@staticmethod
	def inflate(json):
		return Page(
			json['_id'],
			json['title'],
			json['namespace']
		)
		
	@staticmethod
	def normalize(name):
		return name.replace(" ", "_").capitalize()

class ByteDiff(DataType):
	
	def __init__(self, bytes, diff):
		self.bytes = int(bytes)
		self.diff  = int(diff)
	
	def deflate(self):
		return {
			'bytes': self.bytes,
			'diff':  self.diff
		}
	
	@staticmethod
	def inflate(json):
		return ByteDiff(
			json['bytes'],
			json['diff']
		)

class Revision(DataType):
	
	def __init__(self, id, user, page, timestamp, comment, diff, revert=None):
		self.id        = int(id)
		self.user      = user
		self.page      = page
		self.timestamp = int(timestamp)
		self.comment   = unicode(comment)
		self.diff      = diff
		self.revert    = revert
	
	def deflate(self):
		return {
			'_id':       self.id,
			'user':      self.user.deflate(),
			'page':      self.page.deflate(),
			'timestamp': self.timestamp,
			'comment':   self.comment,
			'diff':      self.diff.deflate(),
			'revert':    self.revert
		}
	
	@staticmethod
	def inflate(json):
		return Revision(
			json['_id'],
			User.inflate(json['user']),
			Page.inflate(json['page']),
			json['timestamp'],
			json['comment'],
			ByteDiff.inflate(json['diff']),
			Revision.inflate(json['revert']) if json['revert'] != None else None
		)
	

class Reverted(DataType):
	
	def __init__(self, revision, history=None, processed=0):
		self.revision  = revision
		self.history   = history if history != None else {}
		self.processed = processed
	
	def deflate(self):
		return {
			'_id':       self.revision.id,
			'revision':  self.revision.deflate(),
			'history':   self.history,
			'processed': self.processed
		}
	
	@staticmethod
	def inflate(json):
		return Reverted(
			Revision.inflate(json['revision']),
			json['history'],
			json['processed']
		)
	

class Change(DataType):
	
	TYPES = {
		'new user': NewUser,
		'new revision': Revision
	}
	
	def __init__(self, id, timestamp, type, change):
		self.id        = int(id)
		self.timestamp = int(timestamp)
		self.type      = type
		self.change    = change
		
	
	def deflate(self):
		return {
			'_id':       self.id,
			'timestamp': self.timestamp,
			'type':      self.type,
			'change':    self.change.deflate()
		}
	
	@staticmethod
	def inflate(json):
		return Change(
			json['_id'],
			json['timestamp'],
			json['type'],
			Change.TYPES[json['type']].inflate(json['change'])
		)