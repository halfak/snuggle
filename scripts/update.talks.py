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
		description="Reloads the model for talk pages in English Wikipedia",
		conflict_handler="resolve"
	)
	parser.add_argument(
		'snuggle_config',
		type=conf_snuggle,
		help='the path to Snuggle\'s configuration file'
	)
	
	args = parser.parse_args()
	
	run(configuration)
	
	
def run(config):
	model = models.Mongo.from_config(configuration)
	
	for user_doc in model.db.users.find({'has_talk_page': True}, fields=['talk', 'name']):
		
		print user_doc['name']
		
		new_threads = []
		
		for thread_doc in user_doc['talk']['threads']:
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
			if len(thead_doc['classes']) == 0:
				new_thread = types.Thread(
					thread_doc['title'],
					None
				)
			elif "welcome" in thread_doc['classes']:
				new_thread = types.Thread(
					thread_doc['title'],
					Trace("welcome message", {})
				)
				
			elif "deletion" in thread_doc['classes']:
				new_thread = types.Thread(
					thread_doc['title'],
					Trace("deletion notification", {})
				)
				
			elif "vandal" in thread_doc['classes']:
				new_thread = types.Thread(
					thread_doc['title'],
					Trace("vandal warning", modifications)
				)
				
			elif "spam" in thread_doc['classes']:
				new_thread = types.Thread(
					thread_doc['title'],
					Trace("spam warning", modifications)
				)
				
			elif "copyright" in thread_doc['classes']:
				new_thread = types.Thread(
					thread_doc['title'],
					Trace("copyright warning", modifications)
				)
				
			elif "block" in thread_doc['classes']:
				new_thread = types.Thread(
					thread_doc['title'],
					Trace("block", {})
				)
				
			elif "csd" in thread_doc['classes']:
				new_thread = types.Thread(
					thread_doc['title'],
					Trace("csd notification", {})
				)
				
			elif "afc" in thread_doc['classes']:
				new_thread = types.Thread(
					thread_doc['title'],
					Trace("articles for creation", {})
				)
				
			elif "teahouse" in thread_doc['classes']:
				new_thread = types.Thread(
					thread_doc['title'],
					Trace("teahouse invitation", {})
				)
				
			else:
				print("Encountered an unknown set %(classes)s" % thread_doc)
			
			if new_thread != None:
				new_threads.append(new_thread)
			
		model.db.users.update(
			{'_id': user_doc['_id']}, 
			{'talk.threads': new_threads.serialize()}
		)
			

class Trace(serializable.Type):
	def __init__(self, name, modifications=None):
		self.name = name
		self.modifications = modifications if modifications != None else {}

class Thread(serializable.Type):
	def __init__(self, title, trace=None):
		self.title = unicode(title)
		self.trace = Trace.deserialize(trace) if trace != None else None
