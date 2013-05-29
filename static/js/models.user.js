models = window.models || {}

models.User = Class.extend({
	init: function(doc){
		this.changed  = new Event(this)
		this.viewed   = new Event(this)
		
		this.selected_changed = new Event(this)
		this.selected.status = false
		
		if(doc){
			this.load_doc(doc)
		}
	},
	selected: function(selected){
		if(selected === undefined){
			return this.selected.status
		}else{
			this.selected.status = Boolean(selected)
			this.selected_changed.notify()
		}
	},
	load_doc: function(doc){
		if(!doc){
			throw "Cannot load empty doc into model.User."
		}
		
		this.id            = doc.id
		this.name          = doc.name
		this.registration  = new Date(doc.registration*miliseconds.SECOND)
		this.views         = doc.views
		this.has_user_page = doc.has_user_page
		this.has_talk_page = doc.has_talk_page
		this.desirability  = new models.User.Desirability(doc.desirability)
		this.category      = new models.User.Category(doc.category)
		this.activity      = new models.User.Activity(doc.activity)
		this.talk          = new models.User.Talk(doc.talk)
		
		this.changed.notify()
	},
	add_view: function(){
		this.views += 1
		this.viewed.notify()
	}
})

models.User.Desirability = Class.extend({
	init: function(doc){
		this.changed = new Event(this)
		
		if(!doc){
			this.likelihood = null
			this.scores = []
		}else{
			this.load_doc(doc)
		}
	},
	load_doc: function(doc){
		if(!doc){
			throw "Cannot load empty doc into model.User.Desirability."
		}
		
		this.likelihood = doc.likelihood
		this.scores = doc.scores
		
		this.changed.notify()
	}
})
models.User.Desirability.deserialize = function(doc){
	return new models.User.Desirability(doc.likelihood, doc.scores)
}

models.User.Category = Class.extend({
	init: function(doc){
		this.changed = new Event(this)
		
		if(doc){
			this.category = 0
			this.history = []
		}else{
			this.load_doc(doc)
		}
		
	},
	load_doc: function(doc){
		if(!doc){
			throw "Cannot load empty doc into model.User.Category."
		}
		
		this.category = doc.category || null
		this.history = doc.history
		
		this.changed.notify()
	}
})
models.User.Category.deserialize = function(doc){
	return new models.User.Category()
}

models.User.Activity = Class.extend({
	init: function(doc){
		this.changed = new Event(this)
		
		if(!doc){
			this.last_activity = null
			this.reverted = 0
			this.self_reverted = 0
			this.revisions = {}
			this.counts = {}
		}else{
			this.load_doc(doc)
		}
	},
	load_doc: function(doc){
		if(!doc){
			throw "Cannot load empty doc into model.User.Activity."
		}
		
		this.last_activity = new Date(doc.last_activity*miliseconds.SECOND)
		this.reverted = doc.reverted
		this.self_reverted = doc.self_reverted
		this.counts = doc.counts
		this.revisions = {}
		for(var id in doc.revisions){
			this.revisions[id] = new models.User.Activity.Revision(doc.revisions[id])
		}
		
		this.changed.notify()
	}
})

models.User.Activity.Revision = Class.extend({
	init: function(doc){
		this.changed = new Event(this)
		
		if(!doc){
			this.id = null
			this.page = null
			this.timestamp = null
			this.comment = null
			this.diff = null
			this.sha1 = null
			this.revert = null
		}else{
			this.load_doc(doc)
		}
	},
	load_doc: function(doc){
		if(!doc){
			throw "Cannot load empty doc into model.User.Activity.Revision."
		}
		
		this.id = doc.id
		this.page = doc.page
		this.timestamp = new Date(doc.timestamp*miliseconds.SECOND)
		this.comment = doc.comment
		this.diff = doc.diff
		this.sha1 = doc.sha1
		this.revert = doc.revert
		
		this.changed.notify()
	}
})

models.User.Talk = Class.extend({
	init: function(doc){
		this.changed = new Event(this)
		
		if(!doc){
			this.last_id = 0
			this.threads = []
		}else{
			this.load_doc(doc)
		}
	},
	load_doc: function(doc){
		if(!doc){
			throw "Cannot load empty doc into model.User.Talk."
		}
		this.last_id = doc.last_id
		this.threads = doc.threads
		
		this.changed.notify()
	}
})