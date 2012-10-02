import logging, sys, pymongo
from snuggle.data.model import Mongo
from snuggle.data.source import DB
from snuggle.mediawiki import API
from snuggle.system import System



def main():
	LOGGING_STREAM = sys.stderr
	logging.basicConfig(
		level=logging.DEBUG,
		stream=LOGGING_STREAM,
		format='%(asctime)s %(levelname)-8s %(message)s',
		datefmt='%b-%d %H:%M:%S'
	)
	logger = logging.Logger("server")
	
	model  = Mongo(pymongo.Connection().newbies)
	source = DB(host='db1047', user='halfak', read_default_file="~/.my.cnf", db="enwiki")
	api    = API("http://en.wikipedia.org/w/api.php")
	
	system = System(model, source, api, minId=531101639)
	
	system.update(1000)
	

if __name__ == "__main__": main()
