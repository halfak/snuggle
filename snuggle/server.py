import argparse, logging, sys
from ConfigParser import SafeConfigParser

from system import System

def main():
	def config(fn):
		cfg = SafeConfigParser
		cfg.read(fn)
	
	parser = argparse.ArgumentParser(
		description='Keeps the model up to date by looping through recentchanges'
	)
	parser.add_argument(
		'config',
		type=config,
		help='the path to the configuration file'
	)
	
	LOGGING_STREAM = sys.stderr
	logging.basicConfig(
		level=logging.DEBUG,
		stream=LOGGING_STREAM,
		format='%(asctime)s %(levelname)-8s %(message)s',
		datefmt='%b-%d %H:%M:%S'
	)
	logger = logging.Logger("server")
	
	logger.info("Configuring system")
	system = System.fromConfig(args.config)
	
	try:
		delay = args.config.getfloat("server", "loop_delay")
		while True:
			system.update()
			time.sleep(delay)
		
	except KeyboardInterrupt:
		logger.info("^C received.  Shutting down.")



if __name__ == "__main__":
	main()
