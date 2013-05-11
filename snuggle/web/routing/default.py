from bottle import route

from snuggle.web import processing

# /
@route("/")
@log_event({'type': "default"})
def default(): return processing.processor.static_file("index.html")
