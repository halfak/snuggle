from data import types
class Changes: 
	
	def __init__(self, db):
		self.db = db
	
	def record(self, change, error=None):
		json = change.deflate()
		if error != None: json.update({'error': str(error)})
		
		self.db.changes.save(json, safe=True)
	
	def last(self):
		jsons = list(self.db.changes.find(sort=[('_id', -1)], limit=1))
		if len(jsons) > 0:
			return types.Change.inflate(jsons[0])
		else:
			return None
