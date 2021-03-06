from bottle import route

from .user_data import user_data

def inspect_routes(app):
	for route in app.routes:
		if 'mountpoint' in route.config:
			prefix = route.config['mountpoint']['prefix']
			subapp = route.config['mountpoint']['target']
	
			for prefixes, route in inspect_routes(subapp):
				yield [prefix] + prefixes, route
		else:
			yield [], route
		
	

