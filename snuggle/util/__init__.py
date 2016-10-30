import importlib, re, json, yaml, calendar, time, datetime, sys

from . import desirability

def import_class(path):
	sys.path.insert(0, ".")
	modules = path.split(".")
	
	try:
		if len(modules) == 1:
			return importlib.import_module(modules[0])
		else:
			module = importlib.import_module(".".join(modules[:-1]))
			return getattr(module, modules[-1])
	
	except ImportError as e:
		raise ImportError(str(e) + "(%s)" % path)


LONG_MW_TIME_STRING = '%Y-%m-%dT%H:%M:%SZ'
"""
The longhand version of MediaWiki time strings.
"""

SHORT_MW_TIME_STRING = '%Y%m%d%H%M%S'
"""
The shorthand version of MediaWiki time strings.
"""

def string_to_timestamp(time_string):
	"""
	Converts a Wikipedia timestamp to a Unix Epoch-based timestamp (seconds 
	since Jan. 1st 1970 GMT).  This function will handle both long 
	(see `LONG_WP_TIME_STRING`) and short (see `SHORT_WP_TIME_STRING`) 
	time formats.
	
	:Parameters:
			time_string : string
					MediaWiki timestamp to be converted
			
	:Return:
			integer Unix Epoch-based timestamp (seconds since Jan. 1st 1970 
			GMT) version of the provided wpTime.
	"""
	try:
			py_time = time.strptime(time_string, LONG_MW_TIME_STRING)
	except ValueError as e:
			try:
					py_time = time.strptime(time_string, SHORT_MW_TIME_STRING)
			except ValueError as e:
					raise ValueError("'%s' is not a valid Wikipedia date format" % time_string)
			
	return int(calendar.timegm(py_time))
	

def timestamp_to_string(timestamp):
	"""
	Converts a Unix Epoch-based timestamp (seconds  since Jan. 1st 1970 GMT)
	timestamp to one acceptable by MediaWiki. 
	
	:Parameters:
			timestamp : int
					Unix timestamp to be converted
			
	:Return:
			string MediaWiki style timestamp (see SHORT_MW_TIME_STRING)
	"""
	
	py_date = datetime.datetime.utcfromtimestamp(timestamp)
	return py_date.strftime('%Y%m%d%H%M%S')



