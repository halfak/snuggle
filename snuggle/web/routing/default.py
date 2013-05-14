from bottle import route

from snuggle.web import processing
from snuggle.web.util import preprocessors

# /
@route("/")
def default(): return processing.processor.static_file("index.html")
