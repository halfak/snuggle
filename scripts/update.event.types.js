db.events.update(
	{'type': 
		{'$in': 
			[
				"server start"
			]
		}
	},
	{'$set': {'type': {'entity': "server", 'action': "started"}}},
	{multi: true}
)
db.events.update(
	{'type':
		{'$in':
			[
				"server stop"
			]
		}
	},
	{'$set': {'type': {'entity': "server", 'action': "stopped"}}},
	{multi: true}
)
db.events.update(
	{'type':
		{'$in':
			[
				"view user"
			]
		}
	},
	{'$set': {'type': {'entity': "user", 'action': "viewed"}}},
	{multi: true}
)
db.events.update(
	{'type':
		{'$in':
			[
				"user query"
			]
		}
	},
	{'$set': {'type': {'entity': "users", 'action': "queried"}}},
	{multi: true}
)
db.events.update(
	{'type': 
		{'$in': 
			[
				"event query"
			]
		}
	},
	{'$set': {'type': {'entity': "events", 'action': "queried"}}},
	{multi: true}
)
db.events.update(
	{'type': 
		{'$in': 
			[
				"ui loaded"
			]
		}
	},
	{'$set': {'type': {'entity': "ui", 'action': "loaded"}}},
	{multi: true}
)
db.events.update(
	{'type': 
		{'$in': 
			[
				"snuggler login"
			]
		}
	},
	{'$set': {'type': {'entity': "snuggler", 'action': "logged in"}}},
	{multi: true}
)
db.events.update(
	{'type': 
		{'$in': 
			[
				"snuggler logout"
			]
		}
	},
	{'$set': {'type': {'entity': "snuggler", 'action': "logged out"}}},
	{multi: true}
)
db.events.update(
	{'type': 
		{'$in': 
			[
				"categorize user",
				"categorizer user"
			]
		}
	},
	{'$set': {'type': {'entity': "user", 'action': "categorized"}}},
	{multi: true}
)
db.events.update(
	{'type': 
		{'$in': 
			[
				"user action"
			]
		}
	},
	{'$set': {'type': {'entity': "user", 'action': "actioned"}}},
	{multi: true}
)