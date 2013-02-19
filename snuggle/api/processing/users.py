from ..util import responses, mediawiki

def send_message(user, action):
	return (
		"\n" + 
		"==%(header)s==\n" + 
		"%(message)s~~~~\n"
	) % action

def invite(user, action):
	return (
		"\n" + 
		"==%(header)s==\n" + 
		"{{subst:Wikipedia:Teahouse/%(template)s|message=%(message)s|sign=~~~~}}\n"
	) % action

def report(user, action):
	return (
		"\n" + 
		"* {{Vandal|%(username)s}} %(reason)s~~~~\n"
	) % {
		'username': user['name'],
		'reason': action['reason']
	}



class Users:
	def __init__(self, db, config):
		self.db = db
		self.mw = mediawiki.MW(config['mediawiki']['api_url'])
		
	
	def view(self, session, user_id):
		try:
			self.db.users.view(user_id, session['snuggler']['meta'])
		except Exception:
			return responses.database_error("storing a view for user %s" % user_id)
		
		return responses.success(True)
	
	def get(self, query):
		try:
			users = list(self.db.users.get(query))
		except Exception:
			return responses.database_error("getting a set of users with query %s" % query)
		
		return responses.success(users)
	
	def rate(self, session, rating):
		try:
			doc = self.db.users.rate(rating['id'], rating['category'], session['snuggler']['meta'])
		except Exception:
			return responses.database_error("storing a rating for user %s" % rating['id'])
		
		return responses.success(doc)
	
	def action(self, session, doc):
		try:
			if doc['action']['action'] == "send message":
				self.mw.pages.append(
					send_message(doc['user'], doc['action']), 
					page_name="User:" + doc['user']['name'],
					cookies=session['snuggler']['cookie']
				)
			elif doc['action']['action'] == "invite":
				self.mw.pages.append(
					invite(doc['user'], doc['action']), 
					page_name="User:" + doc['user']['name'],
					cookies=session['snuggler']['cookie']
				)
			elif doc['action']['action'] == "report":
				self.mw.pages.append(
					report(doc['user'], doc['action']), 
					page_name="Wikipedia:Administrator intervention against vandalism",
					cookies=session['snuggler']['cookie']
				)
			else:
				return responses.general_error("performing a user action.  The action %s is not recognized." % doc['action']['action'])
			
			return responses.success(True)
			
		except mediawiki.MWAPIError as e:
			return responses.mediawiki_error("preview some markup", e.code, e.info)
		except mediawiki.ConnectionError as e:
			return responses.mediawiki_error("preview some markup", "Connection Failed", e.info)
		except Exception as e:
			return responses.general_error("preview some markup")
	
	def action_preview(self, session, doc):
		try:
			if doc['action']['action'] == "send message":
				html = self.mw.pages.preview(
					send_message(doc['user'], doc['action']), 
					page_name="User:" + doc['user']['name'],
					cookies=session['snuggler']['cookie']
				)
			elif doc['action']['action'] == "invite":
				html = self.mw.pages.preview(
					invite(doc['user'], doc['action']), 
					page_name="User:" + doc['user']['name'],
					cookies=session['snuggler']['cookie']
				)
			elif doc['action']['action'] == "report":
				html = self.mw.pages.preview(
					report(doc['user'], doc['action']), 
					page_name="Wikipedia:Administrator intervention against vandalism",
					cookies=session['snuggler']['cookie']
				)
			else:
				return responses.general_error("preview some markup.  The action %s is not recognized." % doc['action']['action'])
			
			return responses.success(html)
			
		except mediawiki.MWAPIError as e:
			return responses.mediawiki_error("preview some markup", e.code, e.info)
		except mediawiki.ConnectionError as e:
			return responses.mediawiki_error("preview some markup", "Connection Failed", e.info)
		except Exception as e:
			return responses.general_error("preview some markup")
		
			
	
	
