import json
from bottle import post, get

from snuggle.web import processing
from snuggle.web.util import preprocessors

# /users/query/
@get("/users/query/<query>")
@preprocessors.session
@preprocessors.query_data(json.loads)
def events_query(session, data):
	return processing.processor.events.query(session, data)

@post("/users/query/")
@preprocessors.session
@preprocessors.post_data(json.loads)
def events_query(session, data):
	return processing.processor.events.query(session, data)



