import json
from bottle import post, get, request

from snuggle.web import processing
from snuggle.web.util import preprocessors

# /oauth/initiate/
@get("/oauth/initiate/")
@preprocessors.session
def oauth_initiate(session): return processing.processor.oauth.initiate(session)

# /oauth/callback/
@get("/oauth/callback/")
@preprocessors.session
def oauth_callback(session): return processing.processor.oauth.complete(session, request.query_string)


