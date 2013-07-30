// require: ui.user.js

ui.User.Model = Class.extend({
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
		this.registration  = new Date(doc.registration*env.miliseconds.SECOND)
		this.views         = doc.views
		this.has_user_page = doc.has_user_page
		this.has_talk_page = doc.has_talk_page
		this.desirability  = new ui.User.Model.Desirability(doc.desirability)
		this.category      = new ui.User.Model.Category(doc.category)
		this.activity      = new ui.User.Model.Activity(doc.activity)
		this.talk          = new ui.User.Model.Talk(doc.talk)
		
		this.changed.notify()
	},
	add_view: function(){
		logger.debug("models.user: Adding view.")
		this.views += 1
		this.viewed.notify()
	}
})

ui.User.Model.Desirability = Class.extend({
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
ui.User.Model.Desirability.deserialize = function(doc){
	return new ui.User.Model.Desirability(doc.likelihood, doc.scores)
}

ui.User.Model.Category = Class.extend({
	init: function(doc){
		this.changed = new Event(this)
		
		if(!doc){
			this.category = null
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
		this.history = doc.history.map(function(h){
			h.timestamp = new Date(h.timestamp*env.miliseconds.SECOND)
			return h
		})
		this.changed.notify()
	}
})
ui.User.Model.Category.deserialize = function(doc){
	return new ui.User.Model.Category(doc.history, doc.category)
}

ui.User.Model.Activity = Class.extend({
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
		
		this.last_activity = new Date(doc.last_activity*env.miliseconds.SECOND)
		this.reverted = doc.reverted
		this.self_reverted = doc.self_reverted
		this.counts = doc.counts
		this.revisions = {}
		for(var id in doc.revisions){
			this.revisions[id] = new ui.User.Model.Activity.Revision(doc.revisions[id])
		}
		
		this.changed.notify()
	}
})

ui.User.Model.Activity.Revision = Class.extend({
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
		this.timestamp = new Date(doc.timestamp*env.miliseconds.SECOND)
		this.comment = doc.comment
		this.diff = doc.diff
		this.sha1 = doc.sha1
		this.revert = doc.revert
		
		this.changed.notify()
	}
})

ui.User.Model.Talk = Class.extend({
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
		logger.debug("models.user.talk: loading new doc " + JSON.stringify(doc))
		if(!doc){
			throw "Cannot load empty doc into model.User.Talk."
		}
		this.last_id = doc.last_id
		this.threads = doc.threads
		
		this.changed.notify()
	}
})
