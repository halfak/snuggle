import sys

sys.path.append("../")

from snuggle import configuration
from snuggle import mediawiki
from snuggle.data import models
configuration.snuggle.load_yaml(open("config/dev.snuggle.yaml"))
configuration.mediawiki.load_yaml(open("config/enwiki.mediawiki.yaml"))

api = mediawiki.API.from_config(configuration)
model = models.Mongo.from_config(configuration)


users = model.users.query(sorted_by="activity.last_activity", limit=100000)

for user in users:
	rev_id, markup = api.pages.get_markup(title="User_talk:" + user.name)
	talk = model.users.update_talk(user.id, rev_id, markup)
	if rev_id != None: model.users.set_talk_page(user.name)
	sys.stderr.write(user.name.encode('utf-8') + " ")
