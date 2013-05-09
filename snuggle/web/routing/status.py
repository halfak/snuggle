from bottle import route

from snuggle.web import processing

# /status/
@route("/status/")
def status(): return processing.processor.status()