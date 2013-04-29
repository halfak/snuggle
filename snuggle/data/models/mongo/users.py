from snuggle.data import types

class Users:
	
	def __init__(self, db):
		self.db    = db
	
	def __contains__(self, id):
		return self.db.users.find_one({'_id': id}, {'_id': 1}) != None
	
	def new(self, user):
		self.db.users.insert(user.deflate(), safe=True)
	
	def add_score(self, score):
		doc = self.db.users.find_one({'_id': score.user.id}, {'desirability': 1})
		if doc != None:
			#Inflate
			desirability = types.Desirability.inflate(doc['desirability'])
			
			#Update
			desirability.add_score(score)
			
			#Re-save
			self.db.users.update(
				{'_id': score.user.id},
				{'$set': 
					{'desirability': desirability.deflate()}
				}
			)
		
	
	def add_revision(self, revision):
		user_id = revision.user.id
		revision = types.UserRevision.convert(revision)
		self.db.users.update(
			{'_id': user_id}, 
			{
				'$set': {
					'activity.revisions.%s' % revision.id: revision.deflate(),
					'activity.last_activity': revision.timestamp
				},
				'$inc': {
					'activity.counts.all': 1,
					'activity.counts.%s' % revision.page.namespace: 1
				}
			},
			safe=True
		)
