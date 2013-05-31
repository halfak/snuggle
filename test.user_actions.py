import getpass

from snuggle import configuration
from snuggle import mediawiki
from snuggle.data import types
configuration.snuggle.load_yaml(open("config/dev.snuggle.yaml"))
configuration.mediawiki.load_yaml(open("config/enwiki.mediawiki.yaml"))

api = mediawiki.API.from_config(configuration)

user_actions = mediawiki.UserActions.from_config(configuration)
for action in user_actions.actions.values():
	print(action.name, action.operations)

request = types.ActionRequest(
	"send message",
	types.User(12345678, "EpochFail"),
	{
		'header': "I am a test",
		'message': "I am also a test"
	},
	True
)
print(request)

id, name, cookies = api.users.authenticate('EpochFail', getpass.getpass("EpochFail's password: "))
snuggler = types.Snuggler(id, name, cookies)
#print(snuggler)

results = user_actions.perform(request, snuggler)

print(list(results))

#api.pages.append("User talk:EpochFail", "Test", cookies=snuggler.cookies, comment="This is a test")
