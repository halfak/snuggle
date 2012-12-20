import bottle, pymongo, json, time

from responses import Success, Error
from util import json_data, session


@bottle.route("/test/<string>", method="GET")
@json_data
@session
def test(session, doc):
	ret = session.get('test')
	session['test'] = doc
	return Success(ret).deflate()
