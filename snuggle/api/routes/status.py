import bottle

start = time.time()

@bottle.route("/status")
def status():
	return Success({'status': "online", 'uptime': time.time() - start})
