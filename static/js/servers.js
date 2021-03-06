servers = window.servers || {}

servers.Local = Class.extend({
	init: function(url){
		this.api      = new LocalAPI(url)
		this.snuggler = new servers.Local.Snuggler(this.api)
		this.users    = new servers.Local.Users(this.api)
		this.events   = new servers.Local.Events(this.api)
	},
	help: function(lang, success, error){
		this.api.post("server", "help", {lang: lang}, success, error)
	},
	/**
	Gets the local server's status.
	*/
	status: function(success, error){
		this.api.post("server", "status", null, success, error)
	}
})

servers.Local.Snuggler = Class.extend({
	init: function(api){
		this.api = api
	},
	status: function(success, error){
		this.api.post(
			'snuggler', 'status',
			null,
			success,
			error
		)
	},
	authenticate: function(name, pass, success, error){
		this.api.post(
			'snuggler', 'authenticate',
			{
				user: name,
				pass: pass
			},
			success, 
			error
		)
	},
	log_out: function(success, error){
		this.api.post(
			'snuggler', 'log_out',
			null,
			success,
			error
		)
	}
})

/**
Represents the server's list of users.
*/
servers.Local.Users = Class.extend({
	/**
	:Parameters:
		api : LocalAPI
			an api for requesting and storing information
	*/
	init: function(api){
		this.api = api
	},
	get: function(user, success, error){
		this.api.post(
			'user', 'get',
			{
				id: user.id,
				name: user.name
			},
			success,
			error
		)
	},
	query: function(filters, success, error, limit, skip){
		filters = filters || {}
		limit   = limit || 25
		skip    = skip || 0
		
		if(filters.category === undefined){throw "category must be a real value"}
		if(!filters.min_edits){throw "min_edits must be a real value"}
		if(!filters.sorted_by){throw "sort_by must be a real value"}
		if(!filters.direction){throw "direction must be a real value"}
		
		this.api.post(
			'users', 'query', 
			$.extend(
				filters,
				{
					limit: limit,
					skip: skip
				}
			), 
			success, 
			error
		)
	},
	view: function(user, success, error){
		this.api.post(
			'user', 'view',
			{
				id: user.id,
				name: user.name
			},
			success,
			error
		)
	},
	categorize: function(user, data, success, error){
		this.api.post(
			'user', 'categorize', 
			{
				id: user.id,
				name: user.name,
				category: data.category,
				comment: data.comment || ""
			},
			success,
			error
		)
	},
	cursor: function(filters){
		return new servers.Local.Users.Cursor(this, filters)
	},
	watch: function(user, success, error){
		this.api.post(
			'user', 'watch',
			{
				id: user.id,
				name: user.name
			},
			success,
			error
		)
	},
	perform_action: function(user, action, watch, success, error){
		this.api.post(
			'user', 'perform_action',
			{
				action_name: action.name,
				user: {
					id: user.id,
					name: user.name
				},
				fields: action.fields(),
				watch: watch
			},
			success,
			error
		)
	},
	preview_action: function(user, action, watch, success, error){
		this.api.post(
			'user', 'preview_action',
			{
				action_name: action.name,
				user: {
					id: user.id,
					name: user.name
				},
				fields: action.fields(),
				watch: watch
			},
			success,
			error
		)
	},
	reload_talk: function(user, success, error){
		this.api.post(
			'user', 'reload/talk',
			{
				id: user.id,
				name: user.name
			},
			success,
			error
		)
	}
})

/**
Represents a database query cursor that can be read by calling next().
*/
servers.Local.Users.Cursor = Class.extend({
	init: function(users, filters){
		this.users = users
		this.filters = filters
		
		this.skip = 0
		this.complete = false
	},
	next: function(n, success, error){
		if(!this.complete){
			this.users.query(
				this.filters,
				function(docs){
					if(docs.length == 0){
						this.complete = true
					}
					this.skip += docs.length
					success(this, docs)
				}.bind(this),
				error,
				n,
				this.skip
			)
		}else{
			success([])
		}
	}
})


/**
Represents the server's list of events.
*/
servers.Local.Events = Class.extend({
	/**
	:Parameters:
		api : `LocalAPI`
			an api for requesting and storing information
	*/
	init: function(api){
		this.api = api
	},
	query: function(filters, success, error, limit, before){
		filters = filters || {}
		limit = limit
		before = before || null
		
		this.api.post(
			'events', 'query', 
			$.extend(
				filters,
				{
					limit: limit,
					before: before
				}
			), 
			success, 
			error
		)
	},
	cursor: function(filters){
		return new servers.Local.Events.Cursor(this, filters)
	}
})

/**
Represents a database query cursor that can be read by calling next().
*/
servers.Local.Events.Cursor = Class.extend({
	init: function(events, filters){
		this.events = events
		this.filters = filters
		
		this.last = null
		this.complete = false
	},
	next: function(n, success, error){
		if(!this.complete){
			last_time = (this.last || {}).system_time
			this.events.query(
				this.filters,
				function(docs){
					if(docs.length == 0){
						this.complete = true
					}else{
						this.last = docs[docs.length-1]
					}
					success(this, docs)
				}.bind(this),
				error,
				n,
				last_time
			)
		}else{
			success([])
		}
	}
})

servers.MediaWiki = Class.extend({
	init: function(url){
		this.api       = new MWAPI(url)
		this.revisions = new servers.MediaWiki.Revisions(this.api)
	}
})
servers.MediaWiki.from_config = function(){
	return new servers.MediaWiki(
		configuration.mediawiki.protocol + "://" + 
		configuration.mediawiki.domain + 
		configuration.mediawiki.path.scripts + 
		configuration.mediawiki.file.api
	)
}

servers.MediaWiki.Revisions = Class.extend({
	init: function(api){
		this.api = api
	},
	diff: function(id, success, error){
		data = {
			action: "query",
			prop: "revisions",
			revids: id,
			rvprop: "ids|content",
			rvdiffto: "prev"
		}
		this.api.jsonp(
			data,
			function(doc){
				if(doc && doc.query){
					if(doc.query.pages){
						var page = doc.query.pages.values()[0]
						if(page && page.revisions && page.revisions[0].diff){
							success(id, page.revisions[0].diff['*'] || '')
						}else{
							error("Could not find revision diffs in response.")
							LOGGING.error(doc)
						}
					}
					else if(doc.query.badrevids){
						error("Could not get diff for revision " + id + ".  It may have been deleted.")
					}else{
						error("Unexpected response format.")
						LOGGING.error(doc)
					}
				}else{
					error("Unexpected response format.")
					LOGGING.error(doc)
				}
			}.bind(this),
			error
		)
	},
	markup: function(id, success, error){
		data = {
			action: "query",
			prop: "revisions",
			revids: id,
			rvprop: "content"
		}
		this.api.jsonp(
			data,
			function(doc){
				if(doc && doc.query){
					if(doc.query.pages){
						var page = doc.query.pages.values()[0]
						if(page && page.revisions && page.revisions[0]){
							success(id, page.revisions[0]['*'] || '')
						}else{
							error("Could not find revision markup in response.")
							LOGGING.error(doc)
						}
					}
					else if(doc.query.badrevids){
						error("Markup missing for revision id " + id + ".  It might have been deleted.")
					}else{
						error("Unexpected response format.")
						LOGGING.error(doc)
					}
				}else{
					error("Unexpected response format.")
					LOGGING.error(doc)
				}
			}.bind(this),
			error
		)
	}
})


servers.local = new servers.Local(""),
servers.mediawiki = servers.MediaWiki.from_config()
