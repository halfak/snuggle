import argparse
from beaker.middleware import SessionMiddleware
import bottle, logging, sys, random, yaml

from snuggle import language, mediawiki

from . import processing, routing

logger = logging.getLogger("snuggle.web.server")

def application(config):
	
	#configure processors
	processing.configure(config)
	
	# Generates a random 25 character sequence
	secret = "".join(chr(random.randrange(32,125)) for i in xrange(25))
	
	#construct app
	return SessionMiddleware(
		bottle.default_app(),
		{
			'session.type': "memory",
			'session.key': "s_id",
			'session.secret': secret,
			'session.timeout': 60*30, #30 minutes
			'session.auto': True
		}
	)

def main():
	def conf_snuggle(fn):
		return yaml.load(open(fn))
	
	def conf_mediawiki(fn):
		mediawiki.configuration.load_yaml(open(fn))
	
	def conf_language(fn):
		language.load_yaml(open(fn))
	
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
		'language_config',
		type=conf_language,
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
		run(args.snuggle_config)
	
def run(config):
	logger.info("Configuring system.")
	app = application(config)
	
	logger.info("Running server.")
	bottle.run(
		app=app, 
		host=config['web_server']['host'],
		port=config['web_server']['port'],
		server='cherrypy'
	)

if __name__ == "__main__":
	logging.debug("calling main()")
	main()