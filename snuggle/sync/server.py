import argparse, logging, sys, time, tempfile, yaml, traceback

from snuggle import configuration
from snuggle.data import types
from snuggle.util import import_class

logger = logging.getLogger("snuggle.sync.server")

def main():
	def conf_snuggle(fn):
		configuration.snuggle.load_yaml(open(fn))
		return configuration.snuggle
	
	def conf_mediawiki(fn):
		configuration.mediawiki.load_yaml(open(fn))
		return configuration.mediawiki
	
	parser = argparse.ArgumentParser(
		description='Starts Snuggle\'s synchronizers.'
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
		profile.runctx("run(configuration, args.debug)", globals(), locals(), f.name)
		p = pstats.Stats(f.name)
		p.strip_dirs().sort_stats("time").print_stats(10)
	else:
		run(configuration, args.debug)

def load_synchronizers(config, model):
	
	for sync_name in config.snuggle['sync_server']['synchronizers']:
		Synchronizer = import_class(config.snuggle[sync_name]['module'])
		yield Synchronizer.from_config(config, model)
		

def run(config, debug):
	LOGGING_STREAM = sys.stderr
	logging.basicConfig(
		level=logging.DEBUG if debug else logging.INFO,
		stream=LOGGING_STREAM,
		datefmt='%H:%M:%S',
		format='%(asctime)s [%(levelname)s] %(name)-8s %(message)s'
	)
	requests_log = logging.getLogger("requests")
	requests_log.setLevel(logging.WARNING)
	logger = logging.Logger("snuggle.sync.server")
	requests_log = logging.getLogger("urllib3")
	requests_log.setLevel(logging.WARNING)
	
	
	logger.info("Configuring system...")
	
	logger.info("Using model %s." % config.snuggle['model']['module'])
	Model = import_class(config.snuggle['model']['module'])
	model = Model.from_config(config)
	model.events.insert(types.ServerStarted("sync"))
	
	synchronizers = list(load_synchronizers(config, model))
	
	logger.info("Starting synchronizers...")
	start_time = time.time()
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
		
		event = types.ServerStopped(
			"sync",
			start_time,
			dict((s.NAME, s.status()) for s in synchronizers)
		)
		model.events.insert(event)
	except Exception as e:
		event = types.ServerStopped(
			"sync",
			start_time,
			dict((s.NAME, s.status()) for s in synchronizers),
			traceback.format_exc()
		)
		model.events.insert(event)

if __name__ == "__main__":
	main()
