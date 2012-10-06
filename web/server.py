import bottle, os.path, time

from responses import Error, Success
import users

start = time.time()

STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")

@bottle.route("/")
def default():
	return bottle.static_file("index.html", root=STATIC_DIR)

@bottle.route("/static/<path:path>")
def static(path):
	return bottle.static_file(os.path.join("static", path), root=STATIC_DIR)
	
@bottle.route("/status")
def status():
	return Success({'status': "online", 'uptime': time.time() - start}).deflate()
	

def main():
	bottle.run(host="0.0.0.0", port=8080)

if __name__ == "__main__": main()