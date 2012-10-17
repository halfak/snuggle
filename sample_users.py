import pymongo, json

db = pymongo.Connection().newbies

users = db.users.find(
	{
		'counts.all': {"$gt": 4}
	},
	limit=100
)
print("SAMPLE = [")
for document in users:
	print("\tUI.User.fromJSON(" + json.dumps(document) + "),")

print("]")

