LocalServer = Class.extend({
	init: function(url){
		this.api      = new LocalAPI(url)
		this.snuggler = new LocalServer.Snuggler(this.api)
		this.users    = new LocalServer.Users(this.api)
	},
	/**
	Gets the local server's status.
	*/
	status: function(success, error){
		this.api.post("server", "status", null, success, error)
	}
})

LocalServer.Snuggler = Class.extend({
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
LocalServer.Users = Class.extend({
	/**
	:Parameters:
		api : LocalAPI
			an api for requesting and storing information
	*/
	init: function(api){
		this.api = api
	},
	get: function(filters, success, error, limit, skip){
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
				name: user.info.name
			},
			success,
			error
		)
	},
	categorize: function(user, category, success, error){
		this.api.post(
			'user', 'categorize', 
			{
				id: user.id,
				name: user.info.name,
				category: category
			},
			success,
			error
		)
	},
	query: function(filters){
		return new LocalServer.Users.Cursor(this, filters)
	},
	watch: function(user, success, error){
		this.api.post(
			'user', 'watch',
			{
				id: user.id,
				name: user.info.name
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
				name: user.info.name
			},
			success,
			error
		)
	}
})

/**
Represents a database query cursor that can be read by calling next().
*/
LocalServer.Users.Cursor = Class.extend({
	init: function(users, filters){
		this.users = users
		this.filters = filters
		
		this.skip = 0
		this.complete = false
	},
	next: function(n, success, error){
		if(!this.complete){
			this.users.get(
				this.filters,
				function(user_docs){
					if(user_docs.length == 0){
						this.complete = true
					}
					user_docs = user_docs.map(this.convert.bind(this))
					success(this, user_docs.map(Model.User.inflate))
					this.skip += user_docs.length
				}.bind(this),
				error,
				n,
				this.skip
			)
		}else{
			success([])
		}
	},
	convert: function(doc){
		for(var id in doc.revisions){
			if(doc.revisions[id].revert && doc.revisions[id].revert.user._id == doc._id){
				doc.revisions[id].revert.self = true
			}
		}
		
		return {
			id: doc._id,
			info: {
				name: doc.name,
				registration: doc.registration,
				reverted: doc.activity.reverted || 0,
				counts: doc.activity.counts,
				views: doc.views,
				has_user: doc.has_user_page,
				has_talk: doc.has_talk_page
			},
			contribs: doc.activity.revisions,
			talk: {
				topics: (doc.talk || {}).topics || []
			},
			category: doc.category
		}
	}
})

MediaWiki = Class.extend({
	init: function(url){
		this.api       = new MWAPI(url)
		this.revisions = new MediaWiki.Revisions(this.api)
	}
})

MediaWiki.Revisions = Class.extend({
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
