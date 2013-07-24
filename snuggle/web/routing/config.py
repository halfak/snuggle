from bottle import route

from snuggle.web import processing
from snuggle.web.util import preprocessors

@route("/config/configuration.js")
@preprocessors.content_type("application/javascript")
def get_configuration():
	return processing.processor.config.get()
