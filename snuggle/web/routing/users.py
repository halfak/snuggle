import json
from bottle import post, get

from snuggle.web import processing
from snuggle.web.util import preprocessors

def utf8(bytes):
	return unicode(bytes, 'utf-8')

# /user/view/
@get("/user/view/<user_id:int>")
@preprocessors.authenticated("to record a view for a user")
def user_view(session, user_id): return processing.processor.users.view(session, user_id)

# /user/categorize/
@get("/user/categorize/<query>")
@preprocessors.query_data(json.loads)
@preprocessors.authenticated("categorize a user")
def user_rate(session, data): return processing.processor.users.categorize(session, data)

@post("/user/categorize/")
@preprocessors.post_data(json.loads)
@preprocessors.authenticated("categorize a user")
def user_rate(session, data): return processing.processor.users.categorize(session, data)

# /user/action/
@get("/user/action/<query>")
@preprocessors.query_data(json.loads)
@preprocessors.authenticated("perform a user action")
def users_action(session, data): return processing.processor.users.action(session, data)

@post("/user/action/")
@preprocessors.post_data(json.loads)
@preprocessors.authenticated("perform a user action")
def users_action(session, data): 
	return processing.processor.users.action(session, data)

# /user/action_preview/
@get("/user/action_preview/<query>")
@preprocessors.query_data(json.loads)
@preprocessors.authenticated("preview a user action")
def users_action_preview(session, data):
	return processing.processor.users.action_preview(session, data)

@post("/user/action_preview/")
@preprocessors.post_data(json.loads)
@preprocessors.authenticated("preview a user action")
def users_action_preview(session, data):
	return processing.processor.users.action_preview(session, data)

# /user/reload/talk/
@get("/user/reload/talk/<user_id:int>")
@preprocessors.authenticated("reload a user's talk page")
def user_reload_talk(session, user_id):
	return processing.processor.users.reload_talk(session, user_id=user_id)

@get("/user/reload/talk/<user_name>")
@preprocessors.authenticated("reload a user's talk page")
def user_reload_talk(session, user_name):
	return processing.processor.users.reload_talk(session, user_name=utf8(user_name))

@post("/user/reload/talk/")
@preprocessors.post_data(int, "user_id")
@preprocessors.authenticated("reload a user's talk page")
def user_reload_talk(session, user_id):
	return processing.processor.users.reload_talk(session, user_id=user_id)

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

# /users/get/
@get("/users/get/<query>")
@preprocessors.query_data(json.loads)
def users_get(data):
	return processing.processor.users.get(data)

@post("/users/get/")
@preprocessors.post_data(json.loads)
def users_get(data):
	return processing.processor.users.get(data)



