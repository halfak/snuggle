
class Users:
	
	def __init__(self, db):
		self.db    = db
	
	def __contains__(self, id):
		return self.db.users.find_one({'_id': id}, {'_id': 1}) != None
	
	def get(self, id):
		doc = self.db.users.find_one({'_id': id}, {'_id': 1})
		if doc == None:
			raise KeyError(id)
		else:
			return User(self.db, doc['_id'])
	
	def new(self, user):
		self.db.users.insert(user.deflate(), safe=True)
	
	def score(self, id, score):
		doc = self.db.users.find_one({'_id': id}, {'scores': 1})
		if doc != None:
			
	
	def add_revision(self, id, revision):
		self.db.users.update(
			{'_id': self.id}, 
			{
				'$set': {
					'revisions.%s' % revision.id: revision.deflate(),
					'last_activity': revision.timestamp
				},
				'$inc': {
					'counts.all': 1,
					'counts.%s' % revision.page.namespace: 1
				}
			},
			safe=True
		)

class User:
	
	def __init__(self, db, id):
		self.id = id
		self.db = db
	
	def score(self, score):
		self.db.users.find_one({'_id': id}, )
	
	def revision(self, revision):
		self.db.users.update(
			{'_id': self.id}, 
			{
				'$set': {
					'revisions.%s' % revision.id: revision.deflate(),
					'last_activity': revision.timestamp
				},
				'$inc': {
					'counts.all': 1,
					'counts.%s' % revision.page.namespace: 1
				}
			},
			safe=True
		)
		
