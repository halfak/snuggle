from bottle import route

from snuggle.web import processing
from snuggle.web.util import preprocessors

@route("/config/configuration.js")
@preprocessors.content_type("application/javascript")
def get_configuration():
	return processing.processor.config.get()

"""
TODO: Probably unnecessary.

@route("/config/snuggle.js")
@preprocessors.content_type("application/javascript")
def get_language():
	return processing.processor.config.snuggle()

@route("/config/mediawiki.js")
@preprocessors.content_type("application/javascript")
def get_language():
	return processing.processor.config.mediawiki()

@route("/config/language.js")
@preprocessors.content_type("application/javascript")
def get_language():
	return processing.processor.config.language()
"""