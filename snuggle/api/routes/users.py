import bottle, pymongo, json, time

from util import responses, handlers
from database import db



################################# Routing ######################################

# /users/get
@bottle.route("/users/get/<query>", method="GET")
@handlers.query_data(json.loads)
def get(data): return queried(data)

@bottle.route("/users/get/", method="POST")
@handlers.post_data(json.loads)
def get(data): return queried(data)

# /user/view
@bottle.route("/user/view/<user_id:int>", method="GET")
@authenticated
def view(session, user_id): return viewed(session, user_id)

# /user/categorize
@bottle.route("/user/categorize/<query>", method="GET")
@query_data(json.loads)
@authenticated
def categorize(session, data): return categorized(session, data)

@bottle.route("/user/categorize/", method="POST")
@post_data(json.loads)
@authenticated
def categorize(session, data): return categorized(session, data)

################################ Logic #########################################

def queried(doc):
	
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
		
		return Success(users)
	except KeyError as e:
		return Error(
			"missing parameter",
			str(e) + " is required.",
			meta={'query': doc}
		)
	except Exception as e:
		return Error(
			"general", 
			"An error has occurred: " + str(e),
			meta={'query': doc}
		)
#{"category":null, "namespace":"all", "min_edits": 10, "sort_by": "registration", "direction": "ascending", "limit": 100, "skip": 0}


def viewed(session, user_id):
	try:
		db.users.update(
			{'_id': user_id},
			{
				'$inc': {'views': 1},
				'$push': 
			},
			safe=True
		)
		
		return Success(True)
	except Exception as e:
		return Error(
			"general", 
			"An error has occurred: " + str(e)
		)


def categorized(doc):
	try:
		if doc['category'] not in CATEGORIES:
			return Error(
				"parameter",
				"Provided category '%s' not in potential categories %s" % (doc['category'], CATEGORIES)
			)
		
		db.users.update(
			{"_id": doc['id']},
			{
				"$set": {'category.current': doc['category']},
				"$push": {'category.history': {'category': doc['category'], 'timestamp': time.time()}}
			},
			safe=True
		)
		
		user_doc = db.users.find_one(doc['id'], fields=['category'])
		
		return Success(user_doc)
		
	except KeyError as e:
		return Error(
			"missing parameter",
			str(e) + " is required.",
			meta={'query': doc}
		)
	except Exception as e:
		return Error(
			"general", 
			"An error has occurred: " + str(e),
			meta={'query': doc}
		)

#{user: 134, "category": "good-faith"}