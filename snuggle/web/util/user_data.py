from bottle import request

def user_data():
	session = request.environ.get('beaker.session')
	if 'snuggler' in session:
		snuggler = session['snuggler']['user']
	else: 
		snuggler = None
		
	
	return snuggler, {
		'ip': request.remote_addr,
		'agent': request.headers.get('User-Agent')
	}
