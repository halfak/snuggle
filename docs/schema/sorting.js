//For user sorting
db.users.ensureIndex({'activity.counts.all': 1, 'registration': 1})
db.users.ensureIndex({'activity.counts.all': 1, 'activity.reverted': 1})
db.users.ensureIndex({'activity.counts.all': 1, 'activity.last_activity': -1})
db.users.ensureIndex({'activity.counts.all': 1, 'desirability.likelihood': -1})
db.users.ensureIndex({'category.category': 1})

db.users.ensureIndex({'activity.counts.0': 1, 'registration': 1})
db.users.ensureIndex({'activity.counts.0': 1, 'activity.reverted': 1})
db.users.ensureIndex({'activity.counts.0': 1, 'activity.last_activity': -1})
db.users.ensureIndex({'activity.counts.0': 1, 'desirability.likelihood': -1})
db.users.ensureIndex({'activity.counts.0': 1, 'activity.counts.all': -1})

db.users.ensureIndex({'activity.counts.1': 1, 'registration': 1})
db.users.ensureIndex({'activity.counts.1': 1, 'activity.reverted': 1})
db.users.ensureIndex({'activity.counts.1': 1, 'activity.last_activity': -1})
db.users.ensureIndex({'activity.counts.1': 1, 'desirability.likelihood': -1})
db.users.ensureIndex({'activity.counts.1': 1, 'activity.counts.all': -1})

db.users.ensureIndex({'activity.counts.2': 1, 'registration': 1})
db.users.ensureIndex({'activity.counts.2': 1, 'activity.reverted': 1})
db.users.ensureIndex({'activity.counts.2': 1, 'activity.last_activity': -1})
db.users.ensureIndex({'activity.counts.2': 1, 'desirability.likelihood': -1})
db.users.ensureIndex({'activity.counts.2': 1, 'activity.counts.all': -1})

db.users.ensureIndex({'activity.counts.3': 1, 'registration': 1})
db.users.ensureIndex({'activity.counts.3': 1, 'activity.reverted': 1})
db.users.ensureIndex({'activity.counts.3': 1, 'activity.last_activity': -1})
db.users.ensureIndex({'activity.counts.3': 1, 'desirability.likelihood': -1})
db.users.ensureIndex({'activity.counts.3': 1, 'activity.counts.all': -1})

db.users.ensureIndex({'activity.counts.4': 1, 'registration': 1})
db.users.ensureIndex({'activity.counts.4': 1, 'activity.reverted': 1})
db.users.ensureIndex({'activity.counts.4': 1, 'activity.last_activity': -1})
db.users.ensureIndex({'activity.counts.4': 1, 'desirability.likelihood': -1})
db.users.ensureIndex({'activity.counts.4': 1, 'activity.counts.all': -1})

db.users.ensureIndex({'activity.counts.5': 1, 'registration': 1})
db.users.ensureIndex({'activity.counts.5': 1, 'activity.reverted': 1})
db.users.ensureIndex({'activity.counts.5': 1, 'activity.last_activity': -1})
db.users.ensureIndex({'activity.counts.5': 1, 'desirability.likelihood': -1})
db.users.ensureIndex({'activity.counts.5': 1, 'activity.counts.all': -1})

db.users.ensureIndex({'activity.counts.6': 1, 'registration': 1})
db.users.ensureIndex({'activity.counts.6': 1, 'activity.reverted': 1})
db.users.ensureIndex({'activity.counts.6': 1, 'activity.last_activity': -1})
db.users.ensureIndex({'activity.counts.6': 1, 'desirability.likelihood': -1})
db.users.ensureIndex({'activity.counts.6': 1, 'activity.counts.all': -1})

db.users.ensureIndex({'activity.counts.7': 1, 'registration': 1})
db.users.ensureIndex({'activity.counts.7': 1, 'activity.reverted': 1})
db.users.ensureIndex({'activity.counts.7': 1, 'activity.last_activity': -1})
db.users.ensureIndex({'activity.counts.7': 1, 'desirability.likelihood': -1})
db.users.ensureIndex({'activity.counts.7': 1, 'activity.counts.all': -1})


