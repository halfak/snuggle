import sys, argparse

sys.path.append("../")

from snuggle import configuration
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
	
	args = parser.parse_args()
	
	run(configuration)
	

def run(config):
	model = models.Mongo.from_config(config)
	
	user_categorizeds = model.events.query(types=[types.UserCategorized.TYPE], deserialize=False)
	
	for event_doc in user_categorizeds:
		if 'category' not in event_doc: continue
		user = types.User.deserialize(event_doc['user'])
		categorization = None
		snuggler = types.Snuggler.deserialize(event_doc['snuggler'])
		try:
			new_user = model.users.get(id=user.id)
			for cat in reversed(new_user.category.history):
				if (
					cat.snuggler == snuggler and 
					abs(cat.timestamp - event_doc['system_time']) < 60 and
					cat.category == event_doc['category']
					):
					categorization = cat
					break
		except KeyError:
			categorization = types.Categorization(snuggler, event_doc['category'], comment=None, timestamp=event_doc['system_time'])
			
		if categorization != None:
			new_event = types.UserCategorized(
				user, 
				categorization, 
				id=event_doc['id'], 
				system_time=event_doc['system_time']
			)
			model.events.insert(new_event, upsert=True)
			sys.stderr.write(".")
		else:
			sys.stderr.write("-")

if __name__ == "__main__": main()

