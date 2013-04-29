import bottle, logging, argparse, json, sys, random
from beaker.middleware import SessionMiddleware

from snuggle.util import load_json_config

from . import database, processing, routing

logger = logging.getLogger("snuggle.api.server")

def load_config(filename):
	return load_json_config(open(filename))

def application(config):
	#configure db
	db = database.DB(config)
	
	#configure processors
	processing.configure(db, config)
	
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
	parser = argparse.ArgumentParser(
		description='Loads a jsop API for snuggle'
	)
	parser.add_argument(
		'config',
		type=load_config,
		help='the path to the configuration file'
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
		run(args.config)
	
def run(config):
	logger.info("Configuring system.")
	app = application(config)
	
	logger.info("Running server.")
	bottle.run(
		app=app, 
		host=config['server']['host'],
		port=config['server']['port'],
		server='cherrypy'
	)

if __name__ == "__main__":
	logging.debug("calling main()")
	main()