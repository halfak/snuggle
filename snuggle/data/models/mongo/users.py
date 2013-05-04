import time

from snuggle.data import types

CATEGORIES = ("bad-faith", "good-faith", "ambiguous")

USER_FIELDS = [
        '_id',
        'name',
        'registration',
        'activity',
        'talk',
        'category',
        'desirability',
        'views',
        'has_user_page',
        'has_talk_page'
]

class Users:
	
	def __init__(self, mongo):
		self.mongo    = mongo
	
	def __contains__(self, id):
		return self.mongo.db.users.find_one({'_id': id}, {'_id': 1}) != None
	
	def with_talk_page(self, title):
		doc = self.mongo.db.users.find_one(
			{'name': types.User.normalize(title)},
			{'_id': 1}
		)
		return doc != None
	
	def insert(self, user):
		self.mongo.db.users.update(
			{'_id': user.id},
			user.deflate(), 
			upsert=True,
			safe=True
		)
	
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
		      min_last_active=60*60*25*5, sorted_by="desirability.likelihood",
		      direction="descending", skip=0, limit=1000,
		      inflate=True):
		docs = self.mongo.db.users.find(
			{
				'category.category': category,
				'activity.counts.%s' % namespace: {'$gt': min_edits},
				'activity.last_activity': {'$gt': time.time() - min_last_active}
			},
			sort=[(sorted_by, 1 if direction == "ascending" else -1)],
			limit=limit,
			skip=skip,  #This is dumb, but it will work for now.
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
			self.mongo.db.users.update(
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
			return doc['_id'], types.Talk.inflate(doc['talk'])
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