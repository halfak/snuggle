import sys, argparse

sys.path.append("../")

from snuggle import configuration
from snuggle import mediawiki
from snuggle.data import models


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
	
def run(config, user_name):
	api = mediawiki.API.from_config(configuration)
	model = models.Mongo.from_config(configuration)
	
	if user_name == None:
		users = model.users.query(sorted_by="activity.last_activity", limit=100000)
	else:
		users = [model.users.get(name=user_name)]
	
	for user in users:
		rev_id, markup = api.pages.get_markup(title="User_talk:" + user.name)
		talk = model.users.update_talk(user.id, rev_id, markup)
		if rev_id != None: model.users.set_talk_page(user.name)
		sys.stderr.write(user.name.encode('utf-8') + " ")


if __name__ == "__main__": main()

