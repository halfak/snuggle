import json
from bottle import route, post

from snuggle.web import processing
from snuggle.web.util import preprocessors

# /server/status/
@route("/server/status/")
def status(): return processing.processor.status()

# /server/help/
@post("/server/help/")
@preprocessors.post_data(json.loads)
def help(data): return processing.processor.help(data)