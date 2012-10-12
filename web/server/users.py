import bottle, pymongo, json

from responses import Success, Error

@bottle.route("/users/<query>", method="GET")
def query(query): return queried(query)

@bottle.route("/users/", method="POST")
def query(): return queried(bottle.request.body.read())

@bottle.route("/view/<user_id:int>")
def view(user_id): return viewed(user_id)

@bottle.route("/rate/<user_id:int>/<rating>")
def rate(user_id, rating): return rated(user_id, rating) 

def queried(query):
	try:
		js = json.loads(query)
	except ValueError as e:
		return Error(
			"decode",
			"Could not decode json in query.", 
			meta={'query': jsdump}
		).deflate()
		
	
	return Error(
		"implemented", 
		"This method has not been implemented yet. Sorry.",
		meta={'query': js}
	).deflate()

def viewed(user_id):
	return Error(
		"implemented", 
		"This method has not been implemented yet. Sorry.",
		meta={'query': js}
	).deflate()

def rated(user_id, rating):
	return Error(
		"implemented", 
		"This method has not been implemented yet. Sorry.",
		meta={'query': js}
	).deflate()
	