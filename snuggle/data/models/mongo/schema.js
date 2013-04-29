db.users.ensureIndex({'name': 1})
db.users.ensureIndex({'registration': 1})
db.changes.ensureIndex({'timestamp': 1})
db.reverteds.ensureIndex({'revision.user._id': 1})
db.reverteds.ensureIndex({'revision.page._id': 1})

db.users.remove()
db.reverteds.remove()
db.changes.remove()
db.scores.remove()


//For sorting

db.users.ensureIndex({'activity.counts.all': 1, 'registration': 1})
db.users.ensureIndex({'activity.counts.all': 1, 'activity.reverted': 1})
db.users.ensureIndex({'activity.counts.all': 1, 'activity.last_timestamp': -1})
db.users.ensureIndex({'activity.counts.all': 1, 'desirability.likelihood': -1})

db.users.ensureIndex({'activity.counts.0': 1, 'registration': 1})
db.users.ensureIndex({'activity.counts.0': 1, 'activity.reverted': 1})
db.users.ensureIndex({'activity.counts.0': 1, 'activity.last_timestamp': -1})
db.users.ensureIndex({'activity.counts.0': 1, 'desirability.likelihood': -1})
db.users.ensureIndex({'activity.counts.0': 1, 'activity.counts.all': -1})

db.users.ensureIndex({'activity.counts.1': 1, 'registration': 1})
db.users.ensureIndex({'activity.counts.1': 1, 'activity.reverted': 1})
db.users.ensureIndex({'activity.counts.1': 1, 'activity.last_timestamp': -1})
db.users.ensureIndex({'activity.counts.1': 1, 'desirability.likelihood': -1})
db.users.ensureIndex({'activity.counts.1': 1, 'activity.counts.all': -1})

db.users.ensureIndex({'activity.counts.2': 1, 'registration': 1})
db.users.ensureIndex({'activity.counts.2': 1, 'activity.reverted': 1})
db.users.ensureIndex({'activity.counts.2': 1, 'activity.last_timestamp': -1})
db.users.ensureIndex({'activity.counts.2': 1, 'desirability.likelihood': -1})
db.users.ensureIndex({'activity.counts.2': 1, 'activity.counts.all': -1})

db.users.ensureIndex({'activity.counts.3': 1, 'registration': 1})
db.users.ensureIndex({'activity.counts.3': 1, 'activity.reverted': 1})
db.users.ensureIndex({'activity.counts.3': 1, 'activity.last_timestamp': -1})
db.users.ensureIndex({'activity.counts.3': 1, 'desirability.likelihood': -1})
db.users.ensureIndex({'activity.counts.3': 1, 'activity.counts.all': -1})

db.users.ensureIndex({'activity.counts.4': 1, 'registration': 1})
db.users.ensureIndex({'activity.counts.4': 1, 'activity.reverted': 1})
db.users.ensureIndex({'activity.counts.4': 1, 'activity.last_timestamp': -1})
db.users.ensureIndex({'activity.counts.4': 1, 'desirability.likelihood': -1})
db.users.ensureIndex({'activity.counts.4': 1, 'activity.counts.all': -1})

db.users.ensureIndex({'activity.counts.5': 1, 'registration': 1})
db.users.ensureIndex({'activity.counts.5': 1, 'activity.reverted': 1})
db.users.ensureIndex({'activity.counts.5': 1, 'activity.last_timestamp': -1})
db.users.ensureIndex({'activity.counts.5': 1, 'desirability.likelihood': -1})
db.users.ensureIndex({'activity.counts.5': 1, 'activity.counts.all': -1})

db.users.ensureIndex({'activity.counts.6': 1, 'registration': 1})
db.users.ensureIndex({'activity.counts.6': 1, 'activity.reverted': 1})
db.users.ensureIndex({'activity.counts.6': 1, 'activity.last_timestamp': -1})
db.users.ensureIndex({'activity.counts.6': 1, 'desirability.likelihood': -1})
db.users.ensureIndex({'activity.counts.6': 1, 'activity.counts.all': -1})

db.users.ensureIndex({'activity.counts.7': 1, 'registration': 1})
db.users.ensureIndex({'activity.counts.7': 1, 'activity.reverted': 1})
db.users.ensureIndex({'activity.counts.7': 1, 'activity.last_timestamp': -1})
db.users.ensureIndex({'activity.counts.7': 1, 'desirability.likelihood': -1})
db.users.ensureIndex({'activity.counts.7': 1, 'activity.counts.all': -1})


