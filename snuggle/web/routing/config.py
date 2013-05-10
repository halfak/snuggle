from bottle import route

from snuggle.web import processing
from snuggle.web.util import preprocessors

@route("/config/language.js")
@preprocessors.content_type("application/javascript")
def get_language():
	return processing.processor.config.language()

@route("/config/mediawiki.js")
@preprocessors.content_type("application/javascript")
def get_language():
	return processing.processor.config.mediawiki()