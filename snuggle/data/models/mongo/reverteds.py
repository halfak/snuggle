from data import types

class Reverteds:
	
	def __init__(self, db):
		self.db = db
	
	def __contains__(self, pageId):
		return self.db.reverteds.find_one({'revision.page._id': pageId}) != None
	
	def new(self, reverted):
		return self.db.reverteds.insert(reverted.deflate())
	
	def get(self, pageId):
		for json in self.db.reverteds.find({'revision.page._id': pageId}):
			yield Reverted(self.db, json)
		
	
	

class Reverted:
	
	PROCESS_LIMIT = 5
	
	def __init__(self, db, json):
		self.db        = db
		self.id        = json['_id']
		self.processed = json['processed']
		self.revision  = types.Revision.inflate(json['revision'])
		self.history   = json['history']
		self.revert    = None
	
	def complete(self):
		return self.processed >= self.PROCESS_LIMIT or self.revert != None
	
	def process(self, revision):
		if revision.sha1 in self.history and revision.sha1 != self.revision.sha1:
			self.revert = revision
			self.db.users.update(
				{'_id': self.revision.user.id},
				{
					'$set': {
						'activity.revisions.%s.revert' % self.id: revision.deflate()
					},
					'$inc': {
						'activity.reverted': 1
					}
				}
			)
			self.delete()
		else:
			self.processed += 1
			
			if self.processed < self.PROCESS_LIMIT:
				self.db.reverteds.update(
					{'_id': self.id},
					{'$set': {'processed': self.processed}},
					safe=True
				)
			else:
				self.delete()
		
	def delete(self):
		self.db.reverteds.remove({'_id': self.id})	
