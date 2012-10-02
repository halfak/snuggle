db.users.ensureIndex({'name': 1})
db.users.ensureIndex({'registration': 1})
db.changes.ensureIndex({'timestamp': 1})
db.reverteds.ensureIndex({'revision.user._id': 1})
db.reverteds.ensureIndex({'revision.page._id': 1})

db.users.remove()
db.reverteds.remove()
db.changes.remove()
