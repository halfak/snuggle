Model = {}

/**
Represents the current snuggle user's status.
*/
Model.Snuggler = Class.extend({
		
	/** */
	init: function(){
		this.creds = null
		this.loading = true
		this.changed = new Event(this)
	},
	
	/**
	Sets the credentials (usually after login).
		
	:Parameters:
		id : int
			Wikipedia user identifier
		name : string
			Wikipedia username
	*/
	set: function(id, name){
		this.creds = {
			id: id,
			name: name
		}
		this.loading = false
		this.changed.notify(this.creds)
	},
	
	/**
	Clears the credentials (usually after logging out.
	*/
	clear: function(){
		this.creds = null
		this.loading = false
		this.changed.notify(this.creds)
	}
})


/** 
Represents a list of `Model.User`.  Users can be appended to the end.  This 
model keeps track of a single selection.  The selection can be shifted (see 
`shift_selection(<delta>)`) or a user can be selected directly (see 
`select(<Model.User>)`).  Also a user can be found for using (get_user(<id>))
*/
Model.UserList = Class.extend({
	/**
	:Parameters:
		users : [Model.User]
			(Optional) a list of `Model.User`s to load
	 */
	init: function(users){
		users = users || []
		this.list = []
		this.map = {}
		
		this.appended      = new Event(this)
		this.cleared       = new Event(this)
		this.user_selected = new Event(this)
		this.is_loading    = new Event(this)
		this.is_loading.status = false
		
		this.clear_selection()
		
		this.append(users)
	},
	
	/**
	Sets or gets the status of loading.
	
	:Parameters:
		loading : Boolean
			should the status be set to loading or not?
	*/
	loading: function(loading){
		if(loading === undefined){
			return this.is_loading.status
		}else{
			this.is_loading.status = Boolean(loading)
			
			this.is_loading.notify(this.is_loading.status)
		}
	},
	
	/**
	Appends a list of `Model.User`s on the end. 
	
	:Paramaters:
		users : [Model.User]
			a list of `Model.User`s to load
	
	*/
	append: function(users){
		var relevant_users = []
		for(var i=0;i<users.length;i++){
			var user = users[i]
			if(!this.map[user.id]){
				this.map[user.id] = user
				relevant_users.push(user)
			}
		}
		this.list = this.list.concat(relevant_users)
		this.appended.notify(relevant_users)
	},
	
	/**
	Clears the list.  This method is intended to be used before loading in
	a new set of users.
	*/
	clear: function(){
		this.list = []
		this.map = {}
		this.clear_selection()
		this.cleared.notify()
	},
	
	/**
	Shifts the selection from the current user in the direction and distance
	described by the provided delta.  A delta of -1 shifts the selection 
	one place towards the beginning of the list.  A delta of 5 shifts the 
	selection five places towards the end of the list.  A delta of zero does
	nothing.  Deltas that attempt to move the cursor outside of the list will
	simply bump up against the sides.
	
	:Parameters:
		delta : int
			the distance and direction to shift the selection
	*/
	shift_selection: function(delta){
		if(this.list.length > 0){//We have users to select!
			if(this.selection.user){//We already have a user selection!
				
				if(!this.selection.i){
					//Figure out where we are in the list
					this.selection.i = this.list.indexOf(this.selection.user)
				}
				
				//Update the index using the delta.  Constrain 
				//ourselves to the limits of the list.
				var new_i = Math.min(
					this.list.length-1, 
					Math.max(
						0,
						this.selection.i + delta
					)
				)
				
				return this.select_i(new_i)
				
			}else{
				return this.select_i(0)
			}
		}else{//No users in the list
			//Nothing to do.
		}
	},
	
	/**
	Gets the currently selected index or shifts the selection to a specified 
	index.  Throws an exception if the index is out of range.  
	
	:Parameters:
		index : int
			the index of the user to select
	*/
	select_i: function(index){
		if(!this.list[index]){//Index out of range
			throw "Index " + i + " out of range(0, " + this.list.length + ")."
		}else{
			return this._update_selection({
				user: this.list[index],
				i: index
			})
		}
	},
	
	/**
	Selects a user in the list.  Throws an exception if the user is not in 
	the list.
	
	:Parameters:
		user : `Model.User`
			the user to select
	*/
	select: function(user){
		if(user == undefined){
			if(this.selection){
				return this.selection.user || null
			}else{
				return null
			}
		}else{
			if(!this.map[user.id]){
				throw "User " + user.id + " does not appear in the list."
			}else{
				return this._update_selection({
					user: user,
					i: null
				})
			}
		}
	},
	
	/**
	Clears the current selection if there is one.
	*/
	clear_selection: function(){
		if(this.selection && this.selection.user){
			this.selection.user.selected(false)
		}
		this.selection = {
			user: null,
			i: null
		}
	},
	
	/**
	Looks a user up by the provided id.  Returns `undefined` if the user
	is not found.
	*/
	get_user: function(user_id){
		return this.map[user_id]
	},
	
	/**
	Don't judge me. 
	*/
	_update_selection: function(selection){
		if(!selection || !selection.user){
			throw "No selection provided to update to."
		}else{
			if(selection.user != this.selection.user){
				this.clear_selection()
				selection.user.selected(true)
				this.selection = selection
				this.user_selected.notify(selection.user)
				return this.selection.user
			}
		}
	},
})
Model.UserList.inflate = function(doc){
	return new Model.UserList(doc.map(Model.User.inflate))
}

/**
Represents a user.  A user has an identifier, some meta information 
(`Model.User.info`), a list of contributions (`Model.User.contribs`) and 
their talk activity (`Model.Talk.info).
*/
Model.User = Selectable.extend({
	/**
	:Parameters:
		id : int
			the user's identifier
		info : `Model.User.Info`
			the user's meta information
		contribs : `Model.User.Contribs`
			the user's list of contributions
		talk : `Model.User.Talk`
			the user's talk page activity
	*/
	init: function(id, info, contribs, talk, category){
		this._super(this)
		this.id        = id
		this.info      = info
		this.contribs  = contribs
		this.talk      = talk
		this.category  = category
		
		this.was_viewed  = info.views > 0
		
		this.viewed     = new Event(this)
	},
	
	/**
	Adds a revision to the user's contribs and updated the metadata.
	
	:Parameters:
		revision : Model.User.Contribs.Revision
			The revision to add. 
	
	*/
	add_revision: function(revision){
		if(this.contribs.add(revision)){
			this.info.inc_count(revision.page.namespace)
		}
	},
	
	/**
	Increments the number of views this user has recieved.
	*/
	add_view: function(){
		this.info.inc_views()
		this.viewed.notify()
	}
})
Model.User.inflate = function(doc){
	return new Model.User(
		doc.id,
		Model.User.Info.inflate(doc.info),
		Model.User.Contribs.inflate(doc.contribs, new Date(doc.info.registration*1000)),
		Model.User.Talk.inflate(doc.talk, doc.name),
		Model.User.Category.inflate(doc.category)
	)
}

	/** The meta information about a user */
	Model.User.Info = Class.extend({
		/** 
		:Parameters:
			name : string
				the user's username
			registration : `Date`
				the user's registration date
			views : int
				the number of times that this user has been viewed
			counts : dict
				a mapping between namespace and the number of a user's revisions in that namespace
			has_email : true | false
				did the user include an email address when registering?
		*/
		init: function(name, registration, views, has_email, counts, category){
			this.name         = name
			this.registration = registration
			this.views        = views || 0
			this.has_email    = has_email
			this.counts       = counts
			this.category     = category
			
			this.changed  = new Event(this)
		},
		
		/**
		Increments the number of views this user has recieved.
		*/	
		inc_views: function(){
			this.views = (this.views || 0) + 1
			this.changed.notify()
		},
		
		/**
		Increments the count of revisions for the provided namespace.
		
		:Parameters:
			namespace : int
				the namespace to increment the values for
		*/
		inc_count: function(ns){
			this.counts[ns] = (this.counts[ns] || 0) + 1
			this.changed.notify()
		}
	})
	Model.User.Info.inflate = function(doc){
		return new Model.User.Info(
			doc.name,
			new Date(doc.registration*1000),
			doc.views,
			doc.has_email || false,
			doc.counts
		)
	}
	
	/** The history of contributions for a user */
	Model.User.Contribs = Class.extend({
		/**
		:Parameters:
			revisions : [`Model.User.Contribs.Revision`]
				a id->revision lookup to load
		*/
		init: function(revisions, registration){
			this.revisions    = revisions
			this.registration = registration
			
			this.revision_added    = new Event(this)
			this.revision_replaced = new Event(this)
		},
		/**
		Adds a revision to the contribs.  If the revision is already 
		present, it will be updated appropriately.
		
		:Parameters:
			revision : `Model.User.Contribs.Revision`
				a revision to add
		*/
		add: function(revision){
			if(this.revisions[revision.id]){
				this.revisions[revision.id] = revision
				this.revision_replaced.notify(revision)
				return false
			}else{
				this.revisions[revision.id] = revision
				this.revision_added.notify(revision)
				return true
			}
		}
	})
	Model.User.Contribs.inflate = function(doc, registration){
		revisions = {}
		for(var id in doc){
			var revision = new Model.User.Contribs.Revision.inflate(doc[id])
			revisions[revision.id] = revision
		}
		return new Model.User.Contribs(revisions, registration)
	}
	
		/** Represents a revision in the contributions of a user */
		Model.User.Contribs.Revision = Class.extend({
			/**
			:Parameters:
				id : int
					the revision identifier
				timestamp : `Date`
					the time the revision took place
				page : dict
					a map of page information {id: <int>, namespace: <int>, title: <int>}
				comment : string
					the revision comment
				revert : dict
					(Optional) a map of the reverting revision info {id: <int>, user: {id: <int>, name: <string>, ...} ...}
					
			*/
			init: function(id, timestamp, page, comment, diff, revert){
				this.id        = id
				this.timestamp = timestamp
				this.page      = page
				this.comment   = comment
				this.diff      = diff
				this.revert    = revert
				
				this.reverted = new Event(this)
		},
			/**
			Sets or retrieves the selection status.  If the selected argument is 
			provided, the selection status is set to the provided value.  If no 
			argument is provided, the selection status (true | false) is returned.
			
			:Parameters:
				selected : boolean
					true to mark as selected, false to mark as unselected
			*/
			select: function(select){
				if(selected === undefined){
					return this.is_selected
				}else{
					//Are we selected or not?
					this.is_selected = Boolean(selected)
					
					//Notify the listeners!
					this.selected.notify(this.is_selected)
					
					return this.is_selected
				}
			},
			
			/**
			Sets a new value for the revert of this revision.
			
			:Parameter:
				revert : obj
					details about the reverting revision
			*/
			set_revert: function(revert){
				this.revert = revert
				this.reverted.notify(revert)
			}
		})
		Model.User.Contribs.Revision.inflate = function(doc){
			return new Model.User.Contribs.Revision(
				doc._id,
				new Date(doc.timestamp*1000),
				doc.page,
				doc.comment,
				doc.diff,
				doc.revert
			)
		}
	Model.User.Talk = Class.extend({
		init: function(threads, username){
			this.changed = new Event(this)
			this.username = username
			this.update(threads)
		},
		update: function(threads){
			this.threads = threads
			
			this.changed.notify(threads)
		}
	})
	Model.User.Talk.inflate = function(doc){
		return new Model.User.Talk(doc.threads.map(function(d){return new Model.User.Talk.Thread(d.title, d.classes)}))
	}
		Model.User.Talk.Thread = Class.extend({
			/**
			:Parameters:
				title : string
					the title
				classes : string
					the template classes (if any)
			*/
			init: function(title, classes){
				this.title   = title
				this.classes = classes || []
			}
		})
	
	Model.User.Category = Class.extend({
		init: function(current, history){
			this.current = current
			this.history = history
			
			this.changed = new Event(this)
		},
		update: function(current, history){
			this.current = current
			this.history = history
			this.changed.notify()
		}
	})
	Model.User.Category.inflate = function(doc){
		doc = doc || {}
		return new Model.User.Category(
			doc.current || null,
			doc.history || []
		)
	}
		

