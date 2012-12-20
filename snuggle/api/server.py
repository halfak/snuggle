import bottle, os.path, time, sys, hashlib
from beaker.middleware import SessionMiddleware

import users, proxy, test, static #Note that static must go last.



WEB_DIR = os.path.join(sys.argv[1], "web")


	

def main():
	app = SessionMiddleware(
		bottle.default_app(),
		{
			'session.type': "memory",
			'session.key': "s_id",
			'session.secret': hashlib.md5(str(time.time())).hexdigest(),
			'session.timeout': 60*30, #30 minutes
			'session.auto': True
		}
	)
	
	bottle.run(app=app, host="0.0.0.0", port=8081, reloader=True, server='cherrypy')

if __name__ == "__main__": main()