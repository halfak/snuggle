from ..util import responses

class Users:
	def __init__(self, db, config):
		self.db = db
		
	
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
	
	def rate(self, user_id, rating):
		try:
			self.db.users.rate(user_id, rating, session['snuggler']['meta'])
		except Exception:
			return responses.database_error("storing a rating for user %s" % user_id)
		
		return responses.success(True)
	
	
