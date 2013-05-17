# TODO: All of this

class Edit:
	
	def __init__(self, title, comment=""):
		self.title   = unicode(title)
		self.comment = unicode(comment)
	
	def _title(self, user, fields):
		
		return self.title % self._vals(user, fields)
	
	def _comment(self, user, fields):
		
		return self.comment % self._vals(user, fields)
	
	def _markup(self, user, fields):
		
		return self.markup % self._vals(user, fields)
	
	def _vals(self, user, fields):
		vals = {
			'user_id': user.id,
			'user_name': user.name,
		}
		vals.update(fields)
		return vals

class Append(Edit):
	
	def __init__(self, title, markup, comment=""):
		Edit.__init__(self, title, comment)
		self.markup = unicode(markup)

class Field:
	pass

class TextField(Field):
	pass

class Action:
	
	def __init__(self, edits):
		self.edits = edits
	
	
	
	
