
class Users:
	
	def __init__(self, db):
		self.db = db
	
	def __contains__(self, id):
		return self.db.users.find({'_id': id}).count() > 0
	
	def get(self, id):
		json = self.db.users.find_one({'_id': id}, {'_id': 1})
		if json == None:
			raise KeyError(id)
		else:
			return User(self.db, json['_id'])
	
	def new(self, user):
		self.db.users.insert(user.deflate(), safe=True)
	

class User:
	
	def __init__(self, db, id):
		self.id = id
		self.db = db
	
	def revision(self, revision):
		self.db.users.update(
			{'_id': self.id}, 
			{'$set': {'revisions.%s' % revision.id: revision.deflate()}},
			safe=True
		)
		
