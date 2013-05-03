from snuggle.data import types

class Users:
	
	def __init__(self, mongo):
		self.mongo    = mongo
	
	def __contains__(self, id):
		return self.db.users.find_one({'_id': id}, {'_id': 1}) != None
		
	def insert(self, user):
		self.db.users.insert(user.deflate(), safe=True)
	
	def get(self, id, inflate=True):
		doc = self.mongo.db.users.find_one({'_id': id})
		if doc != None:
			if not inflate:
				return doc
			else:
				return types.NewUser.inflate(doc)
		else:
			return KeyError(id)
		
	def query(self, 
		      category=None, namespace="all", min_edits=1, 
		      min_last_active=0, sorted_by="desirability.likelihood",
		      direction="descending", inflate=True):
		docs = self.db.mongo.users.find(
			{
				'category.current': query['category'] if query['category'] != None else {'$exists': False},
				'activity.counts.%s' % query['namespace']: {'$gt': query['min_edits']},
				'activity.last_activity': {'$gt': time.time() - min_last_active}
			},
			sort=[(query['sorted_by'], 1 if query['direction'] == "ascending" else -1)],
			limit=query['limit'],
			skip=query['skip'],  #This is dumb, but it will work for now.
			fields=USER_FIELDS
		)
		if not inflate:
			return docs
		else:
			return (types.NewUser.inflate(doc) for doc in docs)
	
	def add_score(self, score):
		doc = self.mongo.db.users.find_one({'_id': score.user.id}, {'desirability': 1})
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
		self.mongo.db.users.update(
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
	
	def set_reverted(self, user_id, rev_id, revert):
		revert = types.Revert.convert(revert)
		self.mongo.db.users.update(
			{'_id': user_id},
			{
				'$set': {
					'activity.revisions.%s.revert' % rev_id: revert.deflate()
				},
				'$inc': {
					'activity.reverted': user_id != revert.user.id,
					'activity.self_reverted': user_id == revert.user.id
				}
			},
			safe=True
		)
	
	def get_talk(self, user_id=None, name=None, title=None):
		if user_id != None:
			spec = {'_id': user_id}
		elif name != None:
			spec = {'name': name}
		elif title != None:
			name = types.User.normalize(title)
			spec = {'name': name}
		else:
			raise TypeError('get_talk expects an argument')
		
		doc = self.mongo.db.users.find_one(
			spec,
			fields={'talk': 1}
		)
		if doc != None:
			return types.Talk.inflate(doc)
		else:
			raise KeyError(str(spec))
	
	def set_talk(self, user_id, talk):
		self.mongo.db.users.update(
			{'_id': user_id},
			{'$set': {
				'talk': talk.deflate()
			}},
			safe=True
		)
	
	def set_talk_page(self, title):
		name = types.User.normalize(title)
		self.mongo.db.users.update(
			{'name': name}, 
			{'$set': {
				'has_talk_page': True
			}},
			safe=True
		)
	
	def set_user_page(self, title):
		name = types.User.normalize(title)
		self.mongo.db.users.update(
			{'name': name}, 
			{'$set': {
				'has_user_page': True
			}},
			safe=True
		)
	
	def add_view(self, user_id):
		self.mongo.db.users.update(
			{'_id': user_id},
			{
				'$inc': {'views': 1},
			},
			safe=True
		)
	
	def categorize(self, user_id, categorization):
		
		doc = self.mongo.db.users.find_and_modify(
			{"_id": user_id},
			{
				"$set": {'category.current': categorization.category},
				"$push": {'category.history': categorization.deflate()}
			},
			safe=True,
			fields=['category'],
			new=True
		)
		return doc