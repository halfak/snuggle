import time, traceback, logging, json

logger = logging.getLogger("snuggle.web.util.responses")

def response(type, doc, meta=None):
	meta = meta if meta != None else {}
	
	if __debug__: meta['time'] = time.time()
	return {unicode(type): doc, 'meta': meta}

def success(doc, meta=None):
	meta = meta if meta != None else {}
	
	return response("success", doc, meta)

def js_variable(var_name, doc):
	return "%s = %s" % (var_name, json.dumps(doc))

def error(code, message, meta=None):
	meta = meta if meta != None else {}
	
	exc = traceback.format_exc()
	if exc != "None\n":
		meta['exception'] = exc
		logger.debug(exc)
	
	return response(
		"error", 
		{
			'code': code, 
			'message': message,
		},
		meta
	)

def missing_parameter(param):
	return error("parameter", "The following parameter is required: '%s'" % param)

def decoding_error(input, decoder):
	return error("decoding", "Could not interpret the following string as %s: '%s'" % (decoder, input))

def database_error(action):
	return error("database", "An database error occurred while attempting to %s" % action)

def mediawiki_error(action, code=None, info=None):
	return error("mediawiki", "Mediawiki return an error while attempting to %s.  %s:%s" % (action, code, info))

def general_error(action):
	return error("general", "An error occurred while attempting to %s" % action)

def session_error():
	return error("session", "The user session does not exist or has been lost.")

def permission_error(action):
	action = action if action != None else "perform this action"
	return error("permissions", "You do not have permission to %s." % action)

def auth_required_error(action):
	action = action if action != None else "perform this action"
	return error("permissions", "You must be logged in to %s." % action)

def auth_error(type):
	return error("authentication", "Authentication failed.", meta={'type': type})
	

