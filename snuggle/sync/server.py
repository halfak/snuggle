import argparse, logging, sys, time, tempfile, json

from snuggle.util import import_class, load_yaml_config

logger = logging.getLogger("snuggle.server")

def main():
	
	def load_config(fn):
		return load_yaml_config(open(fn))
	
	parser = argparse.ArgumentParser(
		description='Keeps the model up to date by looping through recentchanges.'
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
		help='runs the server in profile mode'
	)
	parser.add_argument(
		'-d', "--debug",
		action="store_true",
		default=False,
		help='display verbose logging information'
	)
	args = parser.parse_args()
	
	if args.profile:
		try:
			import pstats
			import cProfile as profile
		except ImportError:
			import profile
			
		f = tempfile.NamedTemporaryFile()
		profile.runctx("run(args.config, args.debug)", globals(), locals(), f.name)
		p = pstats.Stats(f.name)
		p.strip_dirs().sort_stats("time").print_stats(10)
	else:
		run(args.config, args.debug)

def load_synchronizers(doc):
	
	Model = import_class(doc['model']['module'])
	model = Model.from_config(doc)
	
	for sync_name in doc['sync_server']['synchronizers']:
		Synchronizer = import_class(doc[sync_name]['module'])
		yield Synchronizer.from_config(doc, model)
		

def run(config_doc, debug):
	LOGGING_STREAM = sys.stderr
	logging.basicConfig(
		level=logging.DEBUG if debug else logging.INFO,
		stream=LOGGING_STREAM,
		datefmt='%H:%M:%S',
		format='%(asctime)s %(name)-8s %(message)s'
	)
	requests_log = logging.getLogger("requests")
	requests_log.setLevel(logging.WARNING)
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
