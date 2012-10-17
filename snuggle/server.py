import argparse, logging, sys, time, tempfile
from ConfigParser import SafeConfigParser

from system import System

logger = logging.getLogger("snuggle.server")

def main():
	def config(fn):
		cfg = SafeConfigParser()
		cfg.read(fn)
		return cfg
	
	parser = argparse.ArgumentParser(
		description='Keeps the model up to date by looping through recentchanges.'
	)
	parser.add_argument(
		'config',
		type=config,
		help='the path to the configuration file'
	)
	parser.add_argument(
		'-p', "--profile",
		action="store_true",
		default=False,
		help='the path to the configuration file'
	)
	parser.add_argument(
		'-d', "--debug",
		action="store_true",
		default=False,
		help='the path to the configuration file'
	)
	args = parser.parse_args()
	
	if args.profile:
		try:
			import pstats
			import cProfile as profile
		except ImportError:
			import profile
			
		f = tempfile.NamedTemporaryFile()
		profile.runctx("run(args)", globals(), locals(), f.name)
		p = pstats.Stats(f.name)
		p.strip_dirs().sort_stats("time").print_stats(10)
	else:
		run(args)


def run(args):
	LOGGING_STREAM = sys.stderr
	logging.basicConfig(
		level=logging.DEBUG if args.debug else logging.INFO,
		stream=LOGGING_STREAM,
		format='%(asctime)s %(levelname)-8s %(message)s',
		datefmt='%b-%d %H:%M:%S'
	)
	logger = logging.Logger("server")
	
	logger.info("Configuring system...")
	system = System.fromConfig(args.config)
	
	delay = args.config.getfloat("server", "loop_delay")
	limit = args.config.getint("server", "update_limit")
	
	logger.info("Starting main loop.")
	try:
		while True:
			system.update(limit)
			time.sleep(delay)
		
	except KeyboardInterrupt:
		logger.info("^C received.  Shutting down.")


if __name__ == "__main__":
	main()
