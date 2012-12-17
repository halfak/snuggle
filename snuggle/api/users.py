import bottle, pymongo, json, time

from responses import Success, Error

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

CATEGORIES = ("bad-faith", "good-faith")

db = pymongo.MongoClient().newbies

@bottle.route("/users/get/<doc_string>", method="GET")
def get(doc_string): return queried(doc_string)

@bottle.route("/users/get/", method="POST")
def get(): return queried(bottle.request.body.read())

@bottle.route("/user/view/<user_id:int>", method="GET")
def view(user_id): return viewed(user_id)

@bottle.route("/user/view/", method="POST")
def view(user_id): 
	try:
		user_id_string = bottle.request.body.read()
		user_id = int(user_id_string)
	except ValueError as e:
		return Error("value", "Could not interpret user_id '%s'" % user_id_string).deflate()

@bottle.route("/user/categorize/<doc>", method="GET")
def categorize(doc): return categorized(doc)

@bottle.route("/user/categorize/", method="POST")
def categorize(): return categorized(bottle.request.body.read())

def queried(query):
	try:
		doc = json.loads(query)
	except ValueError as e:
		return Error(
			"decode",
			"Could not decode json in query.", 
			meta={'query': query}
		).deflate()
	
	try:
		
		users = list(db.users.find(
			{
				'category.current': doc['category'] if doc['category'] != "unsorted" else {'$exists': false},
				'counts.%s' % doc['namespace']: {'$gt': doc['min_edits']}
			},
			sort=[(doc['sorted_by'], 1 if doc['direction'] == "ascending" else -1)],
			limit=doc['limit'],
			skip=doc['skip'],  #This is dumb, but it will work for now.
			fields=USER_FIELDS
		))
		
		return Success(users).deflate()
	except KeyError as e:
		return Error(
			"missing parameter",
			str(e) + " is required.",
			meta={'query': doc}
		).deflate()
	except Exception as e:
		return Error(
			"general", 
			"An error has occurred: " + str(e),
			meta={'query': doc}
		).deflate()
#{"category":null, "namespace":"all", "min_edits": 10, "sort_by": "registration", "direction": "ascending", "limit": 100, "skip": 0}


def viewed(user_id):
	try:
		db.users.update(
			{'_id': user_id},
			{
				'$inc': {'views': 1},
			},
			safe=True
		)
		
		return Success(True).deflate()
	except Exception as e:
		return Error(
			"general", 
			"An error has occurred: " + str(e)
		).deflate()


def categorized(query):
	try:
		doc = json.loads(query)
	except ValueError as e:
		return Error(
			"decode",
			"Could not decode json in query.", 
			meta={'query': query}
		).deflate()
	
	
	try:
		if doc['category'] not in CATEGORIES:
			return Error(
				"parameter",
				"Provided category '%s' not in potential categories %s" % (doc['category'], CATEGORIES)
			).deflate()
		
		db.users.update(
			{"_id": doc['id']},
			{
				"$set": {'category.current': doc['category']},
				"$push": {'category.history': {'category': doc['category'], 'timestamp': time.time()}}
			},
			safe=True
		)
		
		user_doc = db.users.find_one(doc['id'], fields=['category'])
		
		return Success(user_doc).deflate()
		
	except KeyError as e:
		return Error(
			"missing parameter",
			str(e) + " is required.",
			meta={'query': doc}
		).deflate()
	except Exception as e:
		return Error(
			"general", 
			"An error has occurred: " + str(e),
			meta={'query': doc}
		).deflate()

#{user: 134, "category": "good-faith"}