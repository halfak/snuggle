import json
from bottle import route, post, get, static_file

from . import preprocessors
from .. import processing

# /
@route("/")
def default(): return processing.processor.static_file("index.html")

# /user/view/
@get("/user/view/<query>")
@preprocessors.authenticated
def user_view(session, id): return processing.processor.users.view(session, id)

# /user/rate/
@get("/user/rate/<query>")
@preprocessors.query_data(json.loads)
@preprocessors.authenticated
def user_rate(session, data): return processing.processor.users.rate(session, data)

@post("/user/rate/")
@preprocessors.post_data(json.loads)
@preprocessors.authenticated
def user_rate(session, data): return processing.processor.users.rate(session, data)

# /users/get/
@get("/users/get/<query>")
@preprocessors.query_data(json.loads)
def users_get(data): return processing.processor.users.get(data)

@post("/users/get/")
@preprocessors.post_data(json.loads)
def users_get(data): return processing.processor.users.get(data)

# /snuggler/authenticate/
@post("/snuggler/authenticate/")
@preprocessors.post_data(json.loads)
@preprocessors.session
def authenticate(session, data): return processing.processor.snugglers.authenticate(session, data)

@get("/snuggler/authenticate/<query>")
@preprocessors.query_data(json.loads)
@preprocessors.session
def authenticate(session, data): return processing.processor.snugglers.authenticate(session, data)

# /snuggler/log_out/
@route("/snuggler/log_out/")
@preprocessors.session
def log_out(session): return processing.processor.snugglers.log_out(session)

# /status/
@route("/status/")
def status(): return processing.processor.status()

# /<path:path>
@get("/<path:path>")
def static(path): return processing.processor.static_file(path)




