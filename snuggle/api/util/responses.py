import time, traceback

import traceback, time, json

def response(type, doc, meta=None):
	meta = meta if meta != None else {}
	
	if __debug__: meta['time'] = time.time()
	return {unicode(type): doc, 'meta': meta}

def success(doc, meta=None):
	meta = meta if meta != None else {}
	
	return response("success", doc, meta)

def error(code, message, meta=None):
	meta = meta if meta != None else {}
	
	exc = traceback.format_exc()
	if exc != "None\n":
		meta['exception'] = exc
	
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
	return error("database", "An error occurred while attempting to %s" % action)

def session_error():
	return error("session", "The user session does not exist or has been lost.")
