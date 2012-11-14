import pymongo, json

db = pymongo.Connection().newbies

users = db.users.find(
	{
		'counts.0': {"$gt": 1}
	},
	limit=200,
	sort=[('_id', 1)]
)
print("SAMPLE = [")
for document in users:
	print("\tUI.User.fromJSON(" + json.dumps(document) + "),")

print("]")

