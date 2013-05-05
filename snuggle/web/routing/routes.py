import json
from bottle import route, post, get, static_file

from . import preprocessors
from .. import processing

def utf8(bytes):
	return unicode(bytes, 'utf-8')

# /
@route("/")
def default(): return processing.processor.static_file("index.html")

# /user/view/
@get("/user/view/<user_id:int>")
@preprocessors.authenticated
def user_view(session, user_id): return processing.processor.users.view(session, user_id)

# /user/categorize/
@get("/user/categorize/<query>")
@preprocessors.query_data(json.loads)
@preprocessors.authenticated
def user_rate(session, data): return processing.processor.users.categorize(session, data)

@post("/user/categorize/")
@preprocessors.post_data(json.loads)
@preprocessors.authenticated
def user_rate(session, data): return processing.processor.users.categorize(session, data)

# /user/action/
@get("/user/action/<query>")
@preprocessors.query_data(json.loads)
@preprocessors.authenticated
def users_action(session, data): return processing.processor.users.action(session, data)

@post("/user/action/")
@preprocessors.post_data(json.loads)
@preprocessors.authenticated
def users_action(session, data): 
	return processing.processor.users.action(session, data)

# /user/action_preview/
@get("/user/action_preview/<query>")
@preprocessors.query_data(json.loads)
@preprocessors.authenticated
def users_action_preview(session, data):
	return processing.processor.users.action_preview(session, data)

@post("/user/action_preview/")
@preprocessors.post_data(json.loads)
@preprocessors.authenticated
def users_action_preview(session, data):
	return processing.processor.users.action_preview(session, data)

# /user/reload/talk/
@get("/user/reload/talk/<user_id:int>")
@preprocessors.authenticated
def user_reload_talk(session, user_id):
	return processing.processor.users.reload_talk(session, user_id=user_id)

@get("/user/reload/talk/<user_name>")
@preprocessors.authenticated
def user_reload_talk(session, user_name):
	return processing.processor.users.reload_talk(session, user_name=utf8(user_name))

@post("/user/reload/talk/")
@preprocessors.post_data(int, "user_id")
@preprocessors.authenticated
def user_reload_talk(session, user_id):
	return processing.processor.users.reload_talk(session, user_id=user_id)

# /user/watch/
@get("/user/watch/<query>")
@preprocessors.query_data(json.loads)
@preprocessors.authenticated
def user_watch(session, data):
	return processing.processor.users.watch(session, data)

@post("/user/watch/")
@preprocessors.post_data(json.loads)
@preprocessors.authenticated 
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

# /status/
@route("/status/")
def status(): return processing.processor.status()

# /<path:path>
@get("/<path:path>")
def static(path): return processing.processor.static_file(path)




