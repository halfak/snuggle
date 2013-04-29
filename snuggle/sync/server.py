import argparse, logging, sys, time, tempfile, json

from snuggle.util import import_class

logger = logging.getLogger("snuggle.server")

def main():
	def json_doc(fn):
		f = open(fn)
		return json.load(f)
	
	parser = argparse.ArgumentParser(
		description='Keeps the model up to date by looping through recentchanges.'
	)
	parser.add_argument(
		'config',
		type=json_doc,
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
		run(args.config, args.debug)

def load_synchronizers(config_doc):
	for sync_section in config_doc['synchronizers']:
		sync_config = config_doc[sync_section]
		Synchronizer = import_class(sync_config['module'])
		yield Synchronizer.from_config(config_doc, sync_section)
		

def run(config_doc, debug):
	LOGGING_STREAM = sys.stderr
	logging.basicConfig(
		level=logging.DEBUG if debug else logging.INFO,
		stream=LOGGING_STREAM,
		format='%(asctime)s %(levelname)-8s %(message)s',
		datefmt='%b-%d %H:%M:%S'
	)
	logger = logging.Logger("snuggle.sync.server")
	
	logger.info("Configuring system...")
	
	synchronizers = list(load_synchronizers(config_doc))
	
	for synchronizer in synchronizers:
		synchronizer.start()
		
	try:
		while True: # For some reason, this is necessary for catching Ctrl^C
			for synchronizer in synchronizers:
				synchronizer.join(5)
		
	except KeyboardInterrupt:
		logger.info("^C received.  Shutting down.")
		
		for synchronizer in synchronizers:
			synchronizer.stop()
			
		for synchronizer in synchronizers:
			synchronizer.join()


if __name__ == "__main__":
	main()
