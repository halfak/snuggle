import bottle, pymongo, json

from responses import Success, Error

USER_FIELDS = [
	'_id',
	'name',
	'registration',
	'counts',
	'reverted',
	'revisions',
	'talk'
]

@bottle.route("/users/get/<doc>", method="GET")
def get(doc): return queried(doc)

@bottle.route("/users/get/", method="POST")
def get_post(): return queried(bottle.request.body.read())

@bottle.route("/user/view/<user_id:int>")
def view(user_id): return viewed(user_id)

@bottle.route("/user/categorize/<doc>")
def categorize(doc): return categorized(doc)

@bottle.route("/user/categorize", method="POST")
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
		db = pymongo.Connection().newbies
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
	return Error(
		"implemented", 
		"This method has not been implemented yet. Sorry."
	).deflate()

def categorized(doc):
	return Error(
		"implemented", 
		"This method has not been implemented yet. Sorry.",
		meta={'query', doc}
	).deflate()