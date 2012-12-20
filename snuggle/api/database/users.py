
CATEGORIES = ("bad-faith", "good-faith")

USER_FIELDS = [
	'_id',
	'name',
	'registration',
	'counts',
	'reverted',
	'revisions',
	'talk',
	'category',
	'views'
]


class Users:
	
	def __init__(self, db):
		self.db = db
	
	def get(self, query):
		return list(self.db.mongo.users.find(
			{
				'category.current': query['category'] if query['category'] != "unsorted" else {'$exists': false},
				'counts.%s' % query['namespace']: {'$gt': query['min_edits']}
			},
			sort=[(query['sorted_by'], 1 if query['direction'] == "ascending" else -1)],
			limit=query['limit'],
			skip=query['skip'],  #This is dumb, but it will work for now.
			fields=USER_FIELDS
		))
	
	def view(self, user_id, snuggler=None):
		self.db.mongo.users.update(
			{'_id': user_id},
			{
				'$inc': {'views': 1},
				'$push': {'viewers': snuggler}
			},
			w=1
		)
	
	def rate(self, user_id, category, snuggler=None):
		if category not in CATEGORIES:
			raise ValueError("Invalid category '%s' not in potential categories %s." % (category, tuple(CATEGORIES)))
		
		self.db.mongo.users.update(
			{"_id": user_id},
			{
				"$set": {'category.current': category},
				"$push": {'category.history': {'snuggler': snuggler, 'category': category, 'timestamp': time.time()}}
			},
			w=1
		)
	
