
def mongoify(doc):
	if 'id' in doc:
		doc['_id'] = doc['id']
		del doc['id']
	
	return doc

def demongoify(doc):
	if "_id" in doc:
		doc['id'] = doc['_id']
		del doc['_id']
	
	return doc
	
