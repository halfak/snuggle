from snuggle.data import types

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
	
	def add_score(self, user_id, score):
		doc = self.db.users.find_one({'_id': user_id}, {'desirability': 1})
		if doc != None:
			#Inflate
			desirability = type.Desirability.inflate(doc)
			
			#Update
			desirability.add_score(score)
			
			#Re-save
			self.db.users.update(
				{'_id': user_id},
				{'$set': 
					{'desirability': desirability.deflate()}
				}
			)
		
	
	def add_revision(self, user_id, revision):
		self.db.users.update(
			{'_id': user_id}, 
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
