import argparse
from beaker.middleware import SessionMiddleware
import bottle, logging, sys, time, random, yaml, traceback


from snuggle import configuration, mediawiki
from snuggle.data import types
from snuggle.web.util import inspect_routes
from snuggle.util import import_class

from . import processing, routing

logger = logging.getLogger("snuggle.web.server")

def main():
	def conf_snuggle(fn):
		configuration.snuggle.load_yaml(open(fn))
		return configuration.snuggle
	
	def conf_mediawiki(fn):
		configuration.mediawiki.load_yaml(open(fn))
		return configuration.mediawiki
	
	def conf_i18n(fn):
		configuration.i18n.load_yaml(open(fn))
		return configuration.i18n
	
	parser = argparse.ArgumentParser(
		description='Loads a jsop API for snuggle'
	)
	parser.add_argument(
		'snuggle_config',
		type=conf_snuggle,
		help='the path to Snuggle\'s configuration file'
	)
	parser.add_argument(
		'mediawiki_config',
		type=conf_mediawiki,
		help='the math to MediaWiki\'s configuration file'
	)
	parser.add_argument(
		'i18n_config',
		type=conf_i18n,
		help='the math to the Language configuration file'
	)
	parser.add_argument(
		'-p', "--profile",
		action="store_true",
		default=False,
		help='run in profile mode?'
	)
	parser.add_argument(
		'-d', "--debug",
		action="store_true",
		default=False,
		help='print debugging output?'
	)
	args = parser.parse_args()
	
	LOGGING_STREAM = sys.stderr
	logging.basicConfig(
		level=logging.DEBUG if args.debug else logging.INFO,
		stream=LOGGING_STREAM,
		format='%(asctime)s %(levelname)-8s %(message)s',
		datefmt='%b-%d %H:%M:%S'
	)
	
	if args.profile:
		try:
			import pstats
			import cProfile as profile
		except ImportError:
			import profile
			
		f = tempfile.NamedTemporaryFile()
		profile.runctx("run(args.config)", globals(), locals(), f.name)
		p = pstats.Stats(f.name)
		p.strip_dirs().sort_stats("time").print_stats(10)
	else:
		run(configuration, args.debug)
	

def run(config, debug):
	logger.info("Configuring system.")
	
	start_time = time.time()
	event = types.ServerStarted("web")
	
	app, model = application(config)
	model.events.insert(event)
	
	for prefixes, route in inspect_routes(app.app):
		abs_prefix = '/'.join(part for p in prefixes for part in p.split('/'))
		logger.debug("\t".join([abs_prefix, route.rule, route.method]))
	
	logger.info("Running server.")
	try:
		
		bottle.run(
			app=app, 
			host=config.snuggle['web_server']['host'],
			port=config.snuggle['web_server']['port'],
			server='cherrypy',
			debug=debug
		)
		
		# Record stop
		event = types.ServerStop(
			"web",
			start_time,
			{}
		)
		model.events.insert(event)
	except Exception:
		
		# Record stop with error
		event = types.ServerStopped(
			"web",
			start_time,
			{},
			traceback.format_exc()
		)
		model.events.insert(event)

def application(config):
	
	Model = import_class(config.snuggle['model']['module'])
	model = Model.from_config(config)
	
	#configure processors
	processing.configure(config, model)
	
	if 'session.secret' not in config.snuggle['web_server']['beaker']:
		# Generates a random 25 character sequence
		secret = "".join(chr(random.randrange(32,125)) for i in xrange(25))
		beaker_config = dict(
			config.snuggle['web_server']['beaker'].items() + 
			{'session.secret': secret}.items()
		)
	else:
		beaker_config = config.snuggle['web_server']['beaker']
	
	#construct app
	return SessionMiddleware(
		bottle.default_app(),
		beaker_config
	), model

if __name__ == "__main__":
	logging.debug("calling main()")
	main()