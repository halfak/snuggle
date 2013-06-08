import json
from bottle import post, get

from snuggle.web import processing
from snuggle.web.util import preprocessors

# /events/query/
@get("/events/query/<query>")
@preprocessors.session
@preprocessors.query_data(json.loads)
def events_query(session, data):
	return processing.processor.events.query(session, data)

@post("/events/query/")
@preprocessors.session
@preprocessors.post_data(json.loads)
def events_query(session, data):
	return processing.processor.events.query(session, data)



