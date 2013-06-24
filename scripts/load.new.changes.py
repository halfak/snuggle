import sys, time

sys.path.append("../")

from snuggle import configuration
from snuggle import changes as HEPR_DERPITY_DERP_HERP
from snuggle.data import models, types

# Update user
class LOLModel:
	
	def __init__(self, mongo):
		self.mongo = mongo
		
	def add_revision(self, revision):
		user_id = revision.user.id
		revision = types.UserRevision.convert(revision)
		doc = revision.serialize()
		self.mongo.db.users.update(
			{'_id': user_id}, 
			{
				'$set': {
					'activity.revisions.%s' % revision.id: doc
				},
				'$inc': {
					'activity.counts.all': 1,
					'activity.counts.%s' % revision.page.namespace: 1
				}
			},
			safe=True
		)


def main():
	configuration.snuggle.load_yaml(open("../config/snuggle.grouplens.yaml"))
	configuration.mediawiki.load_yaml(open("../config/enwiki.mediawiki.yaml"))
	
	lol_model = LOLModel(models.Mongo.from_config(configuration))
	changes = HEPR_DERPITY_DERP_HERP.MWAPI.from_config(configuration)
	
	start_time = time.time()
	
	last_timestamp = 0
	
	while last_timestamp < (start_time - 60*60*5): # 5 hours ago
		sys.stderr.write(str(changes.rccontinue))
		for change in changes.read(limit=100, types=['new']):
			assert change.type == "new revision"
			sys.stderr.write(".")
			lol_model.add_revision(change.change)
			last_timestamp = change.timestamp
			
		sys.stderr.write("\n")

if __name__ == "__main__": main()
