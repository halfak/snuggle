import json
from bottle import post, get

from snuggle.web import processing
from snuggle.web.util import preprocessors

def utf8(bytes):
	return unicode(bytes, 'utf-8')

# /user/view/
@get("/user/view/<query>")
@preprocessors.query_data(json.loads)
@preprocessors.authenticated("to record a view for a user")
def user_view(session, data): return processing.processor.users.view(session, data)

@post("/user/view/")
@preprocessors.post_data(json.loads)
@preprocessors.authenticated("to record a view for a user")
def user_view(session, data): return processing.processor.users.view(session, data)

# /user/categorize/
@get("/user/categorize/<query>")
@preprocessors.query_data(json.loads)
@preprocessors.authenticated("categorize a user")
def user_rate(session, data): return processing.processor.users.categorize(session, data)

@post("/user/categorize/")
@preprocessors.post_data(json.loads)
@preprocessors.authenticated("categorize a user")
def user_rate(session, data): return processing.processor.users.categorize(session, data)

# /user/perform_action/
@get("/user/perform_action/<query>")
@preprocessors.query_data(json.loads)
@preprocessors.authenticated("perform a user action")
def perform_action(session, data): 
	return processing.processor.users.perform_action(session, data)

@post("/user/perform_action/")
@preprocessors.post_data(json.loads)
@preprocessors.authenticated("perform a user action")
def perform_action(session, data): 
	return processing.processor.users.perform_action(session, data)

# /user/preview_action/
@get("/user/preview_action/<query>")
@preprocessors.query_data(json.loads)
@preprocessors.authenticated("preview a user action")
def preview_action(session, data):
	return processing.processor.users.preview_action(session, data)

@post("/user/preview_action/")
@preprocessors.post_data(json.loads)
@preprocessors.authenticated("preview a user action")
def preview_action(session, data):
	return processing.processor.users.preview_action(session, data)

# /user/reload/talk/
@get("/user/reload/talk/<user_id:int>")
@preprocessors.authenticated("reload a user's talk page")
def user_reload_talk(session, user_id):
	return processing.processor.users.reload_talk(session, {'id': user_id})

@get("/user/reload/talk/<user_name>")
@preprocessors.authenticated("reload a user's talk page")
def user_reload_talk(session, user_name):
	return processing.processor.users.reload_talk(session, {'name': user_name})

@post("/user/reload/talk/")
@preprocessors.post_data(json.loads)
@preprocessors.authenticated("reload a user's talk page")
def user_reload_talk(session, data):
	return processing.processor.users.reload_talk(session, data)

# /user/watch/
@get("/user/watch/<query>")
@preprocessors.query_data(json.loads)
@preprocessors.authenticated("add a user to your watchlist")
def user_watch(session, data):
	return processing.processor.users.watch(session, data)

@post("/user/watch/")
@preprocessors.post_data(json.loads)
@preprocessors.authenticated("add a user to your watchlist")
def user_watch(session, data):
	return processing.processor.users.watch(session, data)

# /users/query/
@get("/users/query/<query>")
@preprocessors.session
@preprocessors.query_data(json.loads)
def user_query(session, data):
	return processing.processor.users.query(session, data)

@post("/users/query/")
@preprocessors.session
@preprocessors.post_data(json.loads)
def user_query(session, data):
	return processing.processor.users.query(session, data)

# /user/get/
@get("/user/get/<query>")
@preprocessors.session
@preprocessors.query_data(json.loads)
def user_query(session, data):
	return processing.processor.users.get(session, data)

@post("/user/get/")
@preprocessors.session
@preprocessors.post_data(json.loads)
def user_query(session, data):
	return processing.processor.users.get(session, data)



