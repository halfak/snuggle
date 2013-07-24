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
		description="Reloads the model for talk pages in English Wikipedia",
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
	
	for user_doc in model.db.users.find({'has_talk_page': True}, fields=['talk', 'name']):
		
		sys.stderr.write(".")
		
		new_threads = []
		
		for thread_doc in user_doc['talk']['threads']:
			if 'classes' in thread_doc:
				modifications = {}
				if 'level_0' in thread_doc['classes']:
					modifications['superscript'] = "0"
				elif 'level_1' in thread_doc['classes']:
					modifications['superscript'] = "1"
				elif 'level_2' in thread_doc['classes']:
					modifications['superscript'] = "2"
				elif 'level_3' in thread_doc['classes']:
					modifications['superscript'] = "3"
				elif 'level_4' in thread_doc['classes']:
					modifications['superscript'] = "4"
				
				new_thread = None
				if len(thread_doc['classes']) == 0:
					new_thread = types.Thread(
						thread_doc['title'],
						None
					)
				elif "welcome" in thread_doc['classes']:
					new_thread = types.Thread(
						thread_doc['title'],
						types.Trace("welcome message", {})
					)
					
				elif "deletion" in thread_doc['classes']:
					new_thread = types.Thread(
						thread_doc['title'],
						types.Trace("deletion notification", {})
					)
					
				elif "vandal" in thread_doc['classes']:
					new_thread = types.Thread(
						thread_doc['title'],
						types.Trace("vandal warning", modifications)
					)
					
				elif "spam" in thread_doc['classes']:
					new_thread = types.Thread(
						thread_doc['title'],
						types.Trace("spam warning", modifications)
					)
					
				elif "copyright" in thread_doc['classes']:
					new_thread = types.Thread(
						thread_doc['title'],
						types.Trace("copyright warning", modifications)
					)
					
				elif "warning" in thread_doc['classes']:
					new_thread = types.Thread(
						thread_doc['title'],
						types.Trace("general warning", {})
					)
					
				elif "block" in thread_doc['classes']:
					new_thread = types.Thread(
						thread_doc['title'],
						types.Trace("block", {})
					)
					
				elif "csd" in thread_doc['classes']:
					new_thread = types.Thread(
						thread_doc['title'],
						types.Trace("csd notification", {})
					)
					
				elif "afc" in thread_doc['classes']:
					new_thread = types.Thread(
						thread_doc['title'],
						types.Trace("articles for creation", {})
					)
					
				elif "teahouse" in thread_doc['classes']:
					new_thread = types.Thread(
						thread_doc['title'],
						types.Trace("teahouse invitation", {})
					)
					
				else:
					new_thread = types.Thread(
						thread_doc['title'],
						None
					)
					print("Encountered an unknown set %(classes)s" % thread_doc)
			else:
				new_thread = types.Thread.deserialize(thread_doc)
			
			new_threads.append(new_thread.serialize())
			
		
		if len(new_threads) > 0:
			model.db.users.update(
				{'_id': user_doc['_id']}, 
				{
					'$set': {'talk.threads': new_threads}
				},
				w=1
			)
	
	sys.stderr.write("\n")
	
if __name__ == "__main__": main()
