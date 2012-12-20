import bottle, os.path

from configuration import config

@bottle.route("/")
def default():
	return bottle.static_file("index.html", root=os.path.join(config['root'], "static"))
	
@bottle.route("/<path:path>")
def static(path):
	return bottle.static_file(path, root=os.path.join(config['root'], "static"))
