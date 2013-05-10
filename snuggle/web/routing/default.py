from bottle import route

from snuggle.web import processing

# /
@route("/")
def default(): return processing.processor.static_file("index.html")
