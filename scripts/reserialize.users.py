import sys, argparse

sys.path.append("../")

from snuggle import configuration
from snuggle import mediawiki
from snuggle.data import models, types


def main():
	def conf_snuggle(fn):
		configuration.snuggle.load_yaml(open(fn))
		return configuration.snuggle
	
	def conf_mediawiki(fn):
		configuration.mediawiki.load_yaml(open(fn))
		return configuration.mediawiki
	
	parser = argparse.ArgumentParser(
		description="Reloads users' talk pages",
		conflict_handler="resolve"
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
		'--user_name',
		type=lambda s: unicode(s, 'utf-8'),
		help='a specific username to reload'
	)
	
	args = parser.parse_args()
	
	run(configuration, args.user_name)

def clear_talk(docs):
	for doc in docs:
		yield types.NewUser.deserialize(doc)
	

def run(config, user_name):
	api = mediawiki.API.from_config(configuration)
	model = models.Mongo.from_config(configuration)
	
	if user_name == None:
		docs = model.users.query(
			sorted_by="activity.last_activity", 
			limit=100000,
			deserialize=False
		)
		users = (types.NewUser.deserialize(doc) for doc in docs)
		
	else:
		users = [model.users.get(name=user_name)]
	
	for user in users:
		sys.stderr.write(".")
		model.users.insert(user, upsert=True)

	sys.stderr.write("\n")

if __name__ == "__main__": main()

