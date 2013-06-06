db.users.ensureIndex({'name': 1})
db.users.ensureIndex({'registration': -1})
db.changes.ensureIndex({'timestamp': -1})
db.reverteds.ensureIndex({'revision.user.id': 1})
db.reverteds.ensureIndex({'revision.page.id': 1})
db.scores.ensureIndex({'user.id': 1})
db.events.ensureIndex({'server_time': -1, 'type': 1})
