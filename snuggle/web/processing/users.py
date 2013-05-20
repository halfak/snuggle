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
			event = types.ViewUser(
				user, 
				session['snuggler']
			)
			self.model.events.insert(event)
		except Exception as e:
			logger.error(traceback.format_exc())
		
		return responses.success(True)
	
	def query(self, session, query):
		try:
			start = time.time()
			users = list(self.model.users.query(deserialize=False, **query))
			end = time.time()
		except Exception:
			logger.error(traceback.format_exc())
			return responses.database_error("getting a set of users with query %s" % query)
		
		try:
			snuggler, data = user_data()
			event = types.UserQuery(
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
			doc = self.model.users.categorize(
				data['id'], 
				types.Categorization(session['snuggler']['user'], data['category'])
			)
			
			try:
				user = types.User(data['id'], data['name'])
				event = types.CategorizeUser(
					user, 
					session['snuggler']['user'], 
					data['category']
				)
				self.model.events.insert(event)
			except Exception as e:
				logger.error(traceback.format_exc())
			
			return responses.success(doc)
		except Exception:
			logger.error(traceback.format_exc())
			return responses.database_error("storing a rating for user %s" % data)
		
	
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
				event = types.WatchUser(
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
	
	def action(self, session, doc):
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
			event = types.UserAction(
				request,
				session['snuggler'],
				results
			)
			self.model.events.insert(event)
		except Exception as e:
			logger.error(traceback.format_exc())
			
		return responses.success(True)
	
	def action_preview(self, session, doc):
		try:
			request = types.ActionRequest.deserialize(doc)
			results = self.user_actions.preview(request, session['snuggler'])
		except errors.MWAPIError as e:
			return responses.mediawiki_error("performing an action %r" % doc, e.code, e.info)
		except errors.ConnectionError as e:
			return responses.mediawiki_error("performing an action", "Connection Failed", e.info)
		except Exception as e:
			logger.error(traceback.format_exc())
			return responses.general_error("performing an action %r" % doc)
			
		return responses.success([result.deserialize() for result in results])
		
	def reload_talk(self, session, doc):
		logger.debug("Reloading talk for %s" % doc)
		try:
			if 'id' in doc:
				user = self.model.users.get(id=doc['id'])
			else:
				user = self.model.users.get(name=doc['name'])
			
			rev_id, markup = self.mwapi.pages.get_markup(title="User_talk:" + user.name)
			talk = types.Talk()
			talk.update(rev_id, markup)
			self.model.users.set_talk(user.id, talk)
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
		
	
	
	
