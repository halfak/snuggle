db.users.ensureIndex({'user.name': 1})
db.reverteds.ensureIndex({'revision.user.id': 1})
db.reverteds.ensureIndex({'revision.page.id': 1})

db.users.remove()
db.reverteds.remove()
db.changes.remove()
