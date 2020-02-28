import time
from pymongo.errors import DuplicateKeyError

from snuggle import mediawiki
from snuggle.data import types

from . import util

CATEGORIES = ("bad-faith", "good-faith", "ambiguous")

USER_FIELDS = [
	'_id',
	'name',
	'registration',
	'activity',
	'talk',
	'category',
	'desirability.ratio',
	'views',
	'has_user_page',
	'has_talk_page'
]

class Users:
	
	def __init__(self, mongo):
		self.mongo = mongo
	
	def __contains__(self, id):
		return self.mongo.db.users.find_one({'_id': id}, {'_id': 1}) != None
	
	def with_talk_page(self, title):
		doc = self.mongo.db.users.find_one(
			{'name': types.User.normalize(title)},
			{'_id': 1}
		)
		return doc != None
	
	def insert(self, user, upsert=False):
		try:
			if not upsert:
				self.mongo.db.users.insert(
					util.mongoify(user.serialize()),
					w=1
				)
			else:
				self.mongo.db.users.save(
					util.mongoify(user.serialize()),
					w=1
				)
			return 1
		except DuplicateKeyError:
			return 0
	
	def get(self, id=None, name=None, deserialize=True):
		if id != None:
			spec = {'_id': id}
		elif name != None:
			spec = {'name': name}
		else:
			raise TypeError("id or name must be specified")
		
		doc = self.mongo.db.users.find_one(spec)
		if doc != None:
			doc = util.demongoify(doc)
			if not deserialize:
				return doc
			else:
				return types.NewUser.deserialize(doc)
		else:
			raise KeyError(spec)
		
	def query(self,
		      category=None, namespace="all", min_edits=1, 
		      min_last_active=60*60*25*5, sorted_by="desirability.likelihood",
		      direction="descending", skip=0, limit=1000,
		      deserialize=True):
		docs = self.mongo.db.users.find(
			{
				'category.category': category,
				'activity.counts.%s' % namespace: {'$gt': min_edits},
				'activity.last_activity': {'$gt': time.time() - min_last_active}
			},
			sort=[(sorted_by, 1 if direction == "ascending" else -1)],
			limit=limit,
			skip=skip  #This is dumb, but it will work for now.
			#timeout=False # Not sure why this would be true by default
		)
		if not deserialize:
			return (util.demongoify(doc) for doc in docs)
		else:
			return (types.NewUser.deserialize(util.demongoify(doc)) for doc in docs)
	
	def add_score(self, score):
		doc = self.mongo.db.users.find_one({'_id': score.user.id}, {'desirability': 1})
		if doc != None:
			#Inflate
			desirability = types.Desirability.deserialize(doc['desirability'])
			
			#Update
			desirability.add_score(score)
			
			#Re-save
			self.mongo.db.users.update(
				{'_id': score.user.id},
				{'$set': 
					{'desirability': desirability.serialize()}
				}
			)
		
	
	def add_revision(self, revision):
		user_id = revision.user.id
		revision = types.UserRevision.convert(revision)
		doc = revision.serialize()
		self.mongo.db.users.update(
			{'_id': user_id}, 
			{
				'$set': {
					'activity.revisions.%s' % revision.id: doc,
					'activity.last_activity': revision.timestamp
				},
				'$inc': {
					'activity.counts.all': 1,
					'activity.counts.%s' % revision.page.namespace: 1
				}
			},
			w=1
		)
	
	def set_reverted(self, user_id, rev_id, revert):
		# TODO: check if revision was already reverted inc
		# Still need to figure out why its so heavily over-counted. 
		revert = types.Revert.convert(revert)
		
		inc = {}
		if user_id == revert.user.id:
			inc['activity.self_reverted'] = 1
		else:
			inc['activity.reverted'] = 1
		
		self.mongo.db.users.update(
			{'_id': user_id},
			{
				'$set': {
					'activity.revisions.%s.revert' % rev_id: revert.serialize()
				},
				'$inc': inc
			},
			w=1
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
			projection=['talk']
		)
		if doc != None:
			return doc['_id'], types.Talk.deserialize(doc['talk'])
		else:
			raise KeyError(str(spec))
	
	def update_talk(self, user_id, rev_id, markup):
		rev_id = rev_id if rev_id != None else 0
		threads = self.mongo.thread_parser.parse(markup)
		#threads = mediawiki.threads.parse(markup) Old version
		
		talk = types.Talk(rev_id, threads)
		
		self.set_talk(user_id, talk)
		return talk
	
	def set_talk(self, user_id, talk):
		self.mongo.db.users.update(
			{'_id': user_id},
			{'$set': {
				'talk': talk.serialize()
			}},
			w=1
		)
	
	def set_talk_page(self, title):
		name = types.User.normalize(title)
		self.mongo.db.users.update(
			{'name': name},
			{'$set': {
				'has_talk_page': True
			}},
			w=1
		)
	
	def set_user_page(self, title):
		name = types.User.normalize(title)
		self.mongo.db.users.update(
			{'name': name}, 
			{'$set': {
				'has_user_page': True
			}},
			w=1
		)
	
	def add_view(self, user_id):
		self.mongo.db.users.update(
			{'_id': user_id},
			{
				'$inc': {'views': 1},
			},
			w=1
		)
	
	def categorize(self, user_id, categorization):
		
		doc = self.mongo.db.users.find_and_modify(
			{"_id": user_id},
			{
				"$set": {'category.category': categorization.category},
				"$push": {'category.history': categorization.serialize()}
			},
			w=1,
			fields=['category'],
			new=True
		)
		return doc['category']
