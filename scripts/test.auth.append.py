################################################################################
#
# This file demonstrates an incompatibility between the MediaWiki API at
# http://en.wikipedia.org and the 'requests' library since version 1.0.0
#
# To run, simply execute "python test.auth.append.py" and fill in your username
# and password at the prompts.
import requests, getpass, sys, json

def get_json(response):
	"""
	Gets the json content out of a requests.response object.  This functionality
	is highly dependant on the version of the requests library used. 
	"""
	if requests.__version__ >= "1.0.0":
		return response.json()
	elif requests.__version__ == "0.14.2":
		return response.json
	else:
		return json.loads(response.content)

print("Using requests library version %s" % requests.__version__)

# Setting up variables. 
uri = "http://en.wikipedia.org/w/api.php" # Location Wikipedia's API
page_name = "Wikipedia:Sandbox" # The page we'll be editing
username = raw_input("Wikipedia username [anon]: ") # Prompts for username

if len(username) > 0:
	# Login or get a token #########################################################
	password = getpass.getpass("Wikipedia password: ") # Prompts for password
	response = requests.post(
		uri,
		data={
			'action': "login",
			'lgname': username,
			'lgpassword': password,
			'format': "json"
		}
	)
	doc = get_json(response)
	
	if 'token' in doc['login']:
		login_token = doc['login']['token']
		print("Passing login token to API: %s" % login_token)
		
		response = requests.post(
			uri,
			data={
				'action': "login",
				'lgname': username,
				'lgpassword': password,
				'lgtoken': login_token,
				'format': "json"
			},
			cookies = response.cookies
		)
		doc = get_json(response)
		
	if doc['login']['result'] == "Success":
		print("Successfully logged in as %s" % doc['login']['lgusername'])
	else:
		print("Login unsuccessful")
		sys.exit(1)
		
	user_cookies = response.cookies
else:
	print("Staying anonymous.")
	user_cookies = None

# Get user info (make sure we're being logged in correctly) ####################
response = requests.post(
	uri,
	data={
		'action': "query",
		'meta': "userinfo",
		'format': "json"
	},
	cookies = user_cookies
)
doc = get_json(response)

print("Currently logged in as %(name)s(%(id)s)" % doc['query']['userinfo'])



# Get edit token ###############################################################
response = requests.post(
	uri,
	data={
		'action': "query",
		'prop': "revisions|info",
		'titles': page_name,
		'intoken': "edit",
		'format': "json"
	},
	cookies = user_cookies
)
doc = get_json(response)

edit_token = doc['query']['pages'].values()[0]['edittoken']
print("Got edit token for %r: %s" % (page_name, edit_token))



# Make edit ####################################################################
response = requests.post(
	uri,
	data={
		'action': "edit",
		'title': page_name,
		'appendtext': "\n\nSome markup to append",
		'summary': "This is a test",
		'token': edit_token,
		'format': "json"
	},
	cookies = user_cookies
)
print(response.content)
