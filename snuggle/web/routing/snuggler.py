import json
from bottle import post, get, route

from snuggle.web import processing
from snuggle.web.util import preprocessors


# /snuggler/authenticate/
@post("/snuggler/authenticate/")
@preprocessors.post_data(json.loads)
@preprocessors.session
def authenticate(session, data):
	return processing.processor.snugglers.authenticate(session, data)

@get("/snuggler/authenticate/<query>")
@preprocessors.query_data(json.loads)
@preprocessors.session
def authenticate(session, data):
	return processing.processor.snugglers.authenticate(session, data)

# /snuggler/log_out/
@route("/snuggler/log_out/", method=["GET", "POST"])
@preprocessors.session
def log_out(session): return processing.processor.snugglers.log_out(session)

# /snuggler/status/
@route("/snuggler/status/", method=["GET", "POST"])
@preprocessors.session
def status(session): return processing.processor.snugglers.status(session)