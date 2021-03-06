import logging, traceback, time
from bottle import request

from snuggle import mediawiki
from snuggle import errors
from snuggle.data import types
from snuggle.web.util import responses, user_data

logger = logging.getLogger("snuggle.web.processing.users")

class Users:
	def __init__(self, model, mwapi, user_actions):
		self.model = model
		self.mwapi = mwapi
		self.user_actions = user_actions
	
	def action(self, session, doc):
		request = types.ActionRequest.serialize(doc)
	
	def view(self, session, doc):
		try:
			self.model.users.add_view(doc['id'])
		except Exception:
			logger.error(traceback.format_exc())
			return responses.database_error("storing a view for user %s" % user_id)
		
		try:
			user = types.User(doc['id'], doc['name'])
			event = types.UserViewed(
				user, 
				session['snuggler']
			)
			self.model.events.insert(event)
		except Exception as e:
			logger.error(traceback.format_exc())
		
		return responses.success(True)
	
	def get(self, session, doc):
		try:
			user = types.User.deserialize(doc)
			start = time.time()
			user_doc = self.model.users.get(id=user.id, deserialize=False)
			end = time.time()
			return responses.success(user_doc)
		except KeyError:
			logger.warning("User %s not found." % user)
			return responses.unknown_user()
		except Exception:
			logger.error(traceback.format_exc())
			return responses.database_error("getting a set of users with query %s" % query)
		
		try:
			snuggler, data = user_data()
			event = types.UsersQueried(
				doc,
				end-start,
				1,
				snuggler,
				data
			)
			self.model.events.insert(event)
		except Exception as e:
			logger.error(traceback.format_exc())
	
	def query(self, session, query):
		try:
			start = time.time()
			users = list(self.model.users.query(deserialize=False, **query))
			for user in users:
				del user['desirability']['scores']
			end = time.time()
		except Exception:
			logger.error(traceback.format_exc())
			return responses.database_error("getting a set of users with query %s" % query)
		
		try:
			snuggler, data = user_data()
			event = types.UsersQueried(
				query,
				end-start,
				len(users),
				snuggler,
				data
			)
			self.model.events.insert(event)
		except Exception as e:
			logger.error(traceback.format_exc())
			
		
		return responses.success(users)
	
	def categorize(self, session, data):
		try:
			categorization = types.Categorization(session['snuggler'], data['category'], data['comment'])
			doc = self.model.users.categorize(
				data['id'], 
				types.Categorization(session['snuggler'], data['category'], data['comment'])
			)
			
			try:
				user = types.User(data['id'], data['name'])
				event = types.UserCategorized(
					user, 
					categorization
				)
				self.model.events.insert(event)
			except Exception as e:
				logger.error(traceback.format_exc())
			
			return responses.success(doc)
		except Exception:
			logger.error(traceback.format_exc())
			return responses.database_error("storing a categorization for user %s" % data)
		
	
	def watch(self, session, doc):
		try:
			user = types.User.deserialize(doc)
			self.mwapi.pages.watch(
				"User:" + user.name,
				cookies=session['snuggler']['cookie']
			)
			self.mwapi.pages.watch(
				"User_talk:" + user.name,
				cookies=session['snuggler']['cookie']
			)
			
			try:
				event = types.UserWatched(
					user, 
					session['snuggler']
				)
				self.model.events.insert(event)
			except Exception as e:
				logger.error(traceback.format_exc())
			
			return responses.success(True)
			
		except errors.MWAPIError as e:
			logger.error(traceback.format_exc())
			return responses.mediawiki_error("Adding %r to watchlist " % user_name, e.code, e.info)
		except errors.ConnectionError as e:
			logger.error(traceback.format_exc())
			return responses.mediawiki_error("Adding %r to watchlist " % user_name, "Connection Failed", e.info)
		except Exception as e:
			logger.error(traceback.format_exc())
			return responses.general_error("Adding %r to watchlist " % user_name)
	
	def perform_action(self, session, doc):
		try:
			request = types.ActionRequest.deserialize(doc)
			results = self.user_actions.perform(request, session['snuggler'])
		except errors.MWAPIError as e:
			logger.error(traceback.format_exc())
			return responses.mediawiki_error("performing an action %r" % doc, e.code, e.info)
		except errors.ConnectionError as e:
			logger.error(traceback.format_exc())
			return responses.mediawiki_error("performing an action", "Connection Failed", e.info)
		except Exception as e:
			logger.error(traceback.format_exc())
			return responses.general_error("performing an action %r" % doc)
				
			
		try:
			event = types.UserActioned(
				request,
				session['snuggler'],
				results
			)
			self.model.events.insert(event)
		except Exception as e:
			logger.error(traceback.format_exc())
			
		return responses.success(True)
	
	def preview_action(self, session, doc):
		try:
			request = types.ActionRequest.deserialize(doc)
			results = self.user_actions.preview(request, session['snuggler'])
		except errors.MWAPIError as e:
			logger.error(traceback.format_exc())
			return responses.mediawiki_error("previewing an action %r" % doc, e.code, e.info)
		except errors.ConnectionError as e:
			logger.error(traceback.format_exc())
			return responses.mediawiki_error("previewing an action", "Connection Failed", e.info)
		except Exception as e:
			logger.error(traceback.format_exc())
			return responses.general_error("previewing an action %r" % doc)
			
		return responses.success([result.serialize() for result in results])
		
	def reload_talk(self, session, doc):
		logger.debug("Reloading talk for %s" % doc)
		try:
			if 'id' in doc:
				user = self.model.users.get(id=doc['id'])
			else:
				user = self.model.users.get(name=doc['name'])
			
			rev_id, markup = self.mwapi.pages.get_markup(title="User_talk:" + user.name)
			talk = self.model.users.update_talk(user.id, rev_id, markup)
			if rev_id != None: self.model.users.set_talk_page(user.name)
			return responses.success(talk.serialize())
		except KeyError as e:
			logger.error(traceback.format_exc())
			return responses.general_error(
				"reloading the talk page for %s" % doc
			)
		except Exception as e:
			logger.error(traceback.format_exc())
			return responses.general_error(
				"reloading the talk page for %s" % doc
			)
		
	
	
	
