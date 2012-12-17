import bottle, os.path, time, sys, hashlib
from beaker.middleware import SessionMiddleware

from responses import Error, Success
import users

start = time.time()

WEB_DIR = os.path.join(sys.argv[1], "web")

@bottle.route("/")
def default():
	return bottle.static_file("index.html", root=WEB_DIR)

@bottle.route("/status")
def status():
	return Success({'status': "online", 'uptime': time.time() - start}).deflate()
	
@bottle.route("/<path:path>")
def static(path):
	return bottle.static_file(path, root=WEB_DIR)

def main():
	app = SessionMiddleware(
		bottle.default_app(),
		{
			'session.type': "memory",
			'key': "s_id",
			'secret': hashlib.md5(str(time.time())).hexdigest(),
			'timeout': 60*30, #30 minutes
			'auto': True
		}
	)
	bottle.run(app=app, host="0.0.0.0", port=8080, reloader=True, server='cherrypy')

if __name__ == "__main__": main()