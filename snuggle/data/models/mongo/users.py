
class Users:
	
	def __init__(self, db, age, clear):
		self.db    = db
		self.age   = age
		self.clear = clear
		self.i     = 0
	
	def __contains__(self, id):
		return self.db.users.find_one({'_id': id}, {'_id': 1}) != None
	
	def get(self, id):
		json = self.db.users.find_one({'_id': id}, {'_id': 1})
		if json == None:
			raise KeyError(id)
		else:
			return User(self.db, json['_id'])
	
	def new(self, user):
		#Clean up users that are too old
		if self.i % self.clear == 0: self.clean(user.registration)
		
		#Insert new user
		self.db.users.insert(user.deflate(), safe=True)
		
		#Increment counter
		self.i += 1
	
	def clean(self, currentTime):
		deaths = [json['_id'] for json in self.db.users.find({'registration': {"$lt": currentTime - self.age}})]
		
		self.db.users.remove({'_id': {"$in": deaths}})
		self.db.reverteds.remove({'revision.user.id': {'$in': deaths}})
		self.db.changes.remove({'timestamp': {"$lt": currentTime - self.age}})
		

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
		
