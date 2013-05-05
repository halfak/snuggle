import logging

from snuggle import mediawiki
from snuggle.data import types
from snuggle.web.util import responses

logger = logging.getLogger("snuggle.web.processing.users")

class Users:
	def __init__(self, model, mwapi):
		self.model = model
		self.mwapi = mwapi
		
	
	def view(self, session, user_id):
		try:
			self.model.users.add_view(user_id)
		except Exception:
			return responses.database_error("storing a view for user %s" % user_id)
		
		return responses.success(True)
	
	def get(self, query):
		try:
			users = list(self.model.users.query(inflate=False, **query))
		except Exception:
			return responses.database_error("getting a set of users with query %s" % query)
		
		return responses.success(users)
	
	def categorize(self, session, data):
		try:
			doc = self.model.users.categorize(
				data['id'], 
				types.Categorization(session['snuggler']['user'], data['category'])
			)
			return responses.success(doc)
		except Exception:
			return responses.database_error("storing a rating for user %s" % data)
		
	
	def watch(self, session, doc):
		try:
			self.mwapi.pages.watch(
				"User:" + doc['name'],
				cookies=session['snuggler']['cookie']
			)
			self.mwapi.pages.watch(
				"User_talk:" + doc['name'],
				cookies=session['snuggler']['cookie']
			)
			
			return responses.success(True)
			
		except mediawiki.MWAPIError as e:
			return responses.mediawiki_error("Adding %r to watchlist " % user_name, e.code, e.info)
		except mediawiki.ConnectionError as e:
			return responses.mediawiki_error("Adding %r to watchlist " % user_name, "Connection Failed", e.info)
		except Exception as e:
			return responses.general_error("Adding %r to watchlist " % user_name)
	
	def action(self, session, doc):
		try:
			action = types.Action.inflate(doc)
			if action.type == "send message":
				self.mwapi.pages.append(
					"User_talk:" + action.user.name,
					action.markup(), 
					cookies=session['snuggler']['cookie'],
					comment=action.header + " ([[WP:Snuggle|Snuggle]])"
				)
			elif action.type == "teahouse invite":
				self.mwapi.pages.append(
					"User_talk:" + action.user.name,
					action.markup(), 
					cookies=session['snuggler']['cookie'],
					comment=action.header + " ([[WP:Snuggle|Snuggle]])"
				)
			elif action.type == "report vandalism":
				self.mwapi.pages.append(
					"Wikipedia:Administrator intervention against vandalism",
					action.markup(), 
					cookies=session['snuggler']['cookie'],
					comment="Reporting " + action.user.name + " " + 
					        action.reason + " ([[WP:Snuggle|Snuggle]])"
				)
			else:
				return responses.general_error(
					"performing a user action.  The action %s is not recognized." % action.type
				)
			
			return responses.success(True)
			
		except mediawiki.MWAPIError as e:
			return responses.mediawiki_error("performing an action %r" % doc, e.code, e.info)
		except mediawiki.ConnectionError as e:
			return responses.mediawiki_error("performing an action", "Connection Failed", e.info)
		except Exception as e:
			return responses.general_error("performing an action %r" % doc)
	
	def action_preview(self, session, doc):
		try:
			action = types.Action.inflate(doc)
			if action.type == "send message":
				html = self.mwapi.pages.preview(
					action.markup(), 
					page_name="User_talk:" + doc['user']['name'],
					cookies=session['snuggler']['cookie']
				)
			elif action.type == "teahouse invite":
				html = self.mwapi.pages.preview(
					action.markup(), 
					page_name="User_talk:" + doc['user']['name'],
					cookies=session['snuggler']['cookie']
				)
			elif action.type == "report vandalism":
				html = self.mwapi.pages.preview(
					action.markup(),
					page_name="Wikipedia:Administrator intervention against vandalism",
					cookies=session['snuggler']['cookie']
				)
			else:
				return responses.general_error(
					"preview some markup.  The action %s is not recognized." % action.type
				)
			
			return responses.success(html)
			
		except mediawiki.MWAPIError as e:
			return responses.mediawiki_error("preview some markup", e.code, e.info)
		except mediawiki.ConnectionError as e:
			return responses.mediawiki_error("preview some markup", "Connection Failed", e.info)
		except Exception as e:
			return responses.general_error("preview some markup")
		
	def reload_talk(self, session, user_id=None, user_name=None):
		logger.debug("Reloading talk for %s:%s" % (user_id, user_name))
		try:
			if user_id != None:
				user = self.model.users.get(id=user_id)
			else:
				user = self.model.users.get(name=user_name)
			
			rev_id, markup = self.mwapi.pages.get_markup(title="User_talk:" + user.name)
			talk = types.Talk()
			talk.update(rev_id, markup)
			self.model.users.set_talk(user.id, talk)
			if rev_id != None: self.model.users.set_talk_page(user.name)
			return responses.success(talk.deflate())
		except KeyError as e:
			return responses.general_error(
				"reloading the talk page for %s:%s" % (user_id, user_name)
			)
		except Exception as e:
			return responses.general_error(
				"reloading the talk page for %s:%s" % (user_id, user_name)
			)
		
	
	
	
