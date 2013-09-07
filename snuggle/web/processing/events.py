import logging, traceback, time
from bottle import request

from snuggle import configuration
from snuggle import mediawiki
from snuggle import errors
from snuggle.data import types
from snuggle.web.util import responses, user_data

logger = logging.getLogger("snuggle.web.processing.users")

class Events:
	def __init__(self, model):
		self.model = model
	
	def action(self, session, doc):
		request = types.ActionRequest.serialize(doc)
	
	def query(self, session, query):
		"""
		Queries for PUBLIC events and public event content only.
		"""
		try:
			start = time.time()
			event_docs = []
			for event in self.model.events.query(**query):
				if event.PUBLIC:
					doc = event.serialize()
					doc['id'] = None
					event_docs.append(doc)
				
			
			end = time.time()
		except Exception:
			logger.error(traceback.format_exc())
			return responses.database_error("getting a set of events with query %s" % query)
		
		query['after'] = max(
			query.get('after', 0), 
			time.time() - configuration.snuggle['changes_synchronizer']['max_age']
		)
		
		try:
			snuggler, data = user_data()
			event = types.EventsQueried(
				query,
				end-start,
				len(event_docs),
				snuggler,
				data
			)
			self.model.events.insert(event)
		except Exception as e:
			logger.error(traceback.format_exc())
			
		
		return responses.success(event_docs)
	
