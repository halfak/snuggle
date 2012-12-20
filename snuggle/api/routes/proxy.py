import bottle, json, time, requests
from collections import namedtuple

from ..util import responses

MW_API = 'https://en.wikipedia.org/w/api.php'

MediaWikiUser = namedtuple("MediaWikiUser", ['id', 'name', 'cookie'])

########################### Routing ############################################

@bottle.route("/proxy/authenicate/<string>", method="GET")
@query_data(json.loads)
@session
def authenicate(session, data): return authenticated(session, doc)


@bottle.route("/proxy/authenicate/", method="POST")
@post_data(json.loads)
@session
def authenicate(session, data): return authenticated(session, doc)

@bottle.route("/proxy/log_out/")
@session
def log_out(session): return logged_out(session)


########################## Logic ###############################################

def authenticated(session, doc):
	if 'mw_user' in session:
		return responses.success("already logged in")
	
	r = requests.post(
		MW_API,
		params={
			'action': "login",
			'lgname': doc['user_name'],
			'lgpassword': doc['password'],
			'format': "json"
		}
	)
	try:
		response_doc = json.loads(r.content)
	except ValueError as e:
		return Error("mw_error", "Could not interpret mediawiki's response: " + r.content)
	
	r = requests.post(
		MW_API,
		params={
			'action': "login",
			'lgname': doc['user_name'],
			'lgpassword': doc['password'],
			'lgtoken': response_doc['login']['token'],
			'format': "json"
		},
		cookies = r.cookies
	)
	
	try:
		response_doc = json.loads(r.content)
	except ValueError as e:
		return Error("mw_error", "Could not interpret mediawiki's response: " + r.content)
	
	if response_doc['login']['result'] == "WrongPass":
		return Error("auth_fail", "Password incorrect")
	elif response_doc['login']['result'] == "NotExists":
		return Error("auth_fail", "There does not appear to be an account with that username.")
	elif response_doc['login']['result'] == "Success":
		session['mw_user'] = MediaWikiUser(
			response_doc['login']['lguserid'], 
			response_doc['login']['lgusername'], 
			r.cookies
		)
		return Success("Session created.")
	

def logged_out(session):
	if 'mw_user' in session:
		del session['mw_user']
	
	return Success(True)
	
	
	
	

