import sys, os, bottle, beaker, hashlib, time

# update the path so we can do some imports. 
sys.path = ['/var/www/halfak/snuggle/web/server'] + sys.path

# get into our directory
os.chdir(os.path.dirname(__file__))

#load the server code
import server, config #Load the application

#start the application
application = bottle.default_app()
application = SessionMiddleware(application, {
	'session.type': "memory",
	'key': "s_id",
	'secret': config.session_secret,
	'timeout': 60*30 #30 minutes,
	'auto': True
	}
)