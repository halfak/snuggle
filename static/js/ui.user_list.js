ui = window.ui || {}

ui.UserList = Class.extend({
	
	init: function(model, view){
		this.model = model || new ui.UserList.Model()
		this.view  = view || new ui.UserList.View(this.model)
		this.node = this.view.node
		
		this.cursor = null
		this.selected = null
		
		this.view.view_changed.attach(this._handle_view_change.bind(this))
		this.view.keypressed.attach(this._handle_keypress.bind(this))
	},
	_handle_view_change: function(_, view){
		this._read_until_full()
	},
	_handle_user_focus: function(user){
		this.model.select(user)
	},
	_handle_user_selected_change: function(user, selected){
		if(selected){
			if(this._view_delay){
				clearTimeout(this._view_delay)
			}
			logger.debug("ui.user_list: delaying view of user")
			this._view_delay = setTimeout(
				function(){this._add_user_view(user)}.bind(this),
				env.delays.user_view_delay
			)
		}
	},
	_handle_keypress: function(_, e){
		if(e.which == env.keys.PAGE_UP){
			this.model.shift_selection(-1)
			util.kill_event(e)
		}else if(e.which == env.keys.PAGE_DOWN){
			this.model.shift_selection(1)
			util.kill_event(e)
		}
	},
	append: function(user){
		user.focussed.attach(this._handle_user_focus.bind(this))
		user.selected_changed.attach(this._handle_user_selected_change.bind(this))
		this.model.append(user)
	},
	load: function(cursor){
		//initialize cursor
		this.cursor = cursor
		this.model.clear()
		this._read_until_full()
		
	},
	_add_user_view: function(user){
		logger.debug("controller.user_list: requesting to add new user view.")
		servers.local.users.view(
			user.model,
			function(doc){
				user.add_view()
			}.bind(this),
			function(message, doc, meta){
				logger.error(message)
			}.bind(this)
		)
	},
	_read_until_full: function(){
		// This function checks to see if we should load
		if(this.cursor && !this.cursor.complete){
			view = this.view.view()
			
			if(view.end - view.bottom < 200 && !this.view.loading()){
				logger.debug("Time to load more results!")
				this._load_more_users()
			}
		}
	},
	_load_more_users: function(){
		if(this.cursor && !this.cursor.complete){
			logger.debug("Sending a request for more users.")
			this.view.loading(true)
			this.cursor.next(
				10,
				function(cursor, docs){
					this.view.loading(false)
					if(cursor == this.cursor){ //If we are still reading from the same cursor
						for(var i=0;i<docs.length;i++){
							this.append(ui.User.from_doc(docs[i]))
						}
					}
					this._read_until_full()
				}.bind(this),
				function(message){
					this.view.loading(false)
					alert(message)
				}.bind(this)
			)
		}
	}
})


/** 
Represents a list of `ui.User`.  Users can be appended to the end.  This 
model keeps track of a single selection.  The selection can be shifted (see 
`shift_selection(<delta>)`) or a user can be selected directly (see 
`select(<ui.User>)`).  Also a user can be found for using (get_user(<id>))
*/
ui.UserList.Model = Class.extend({
	init: function(){
		this.list = []
		this.map = {}
		
		this.appended          = new Event(this)
		this.cleared           = new Event(this)
		this.user_selected     = new Event(this)
		
		this.clear_selection()
	},
	
	/**
	Appends a list of `controllers.User`s on the end. 
	
	:Paramaters:
		user : controllers.User
			a list of `controllers.User`s to load
	
	*/
	append: function(user){
		if(!this.map[user.id]){
			this.map[user.id] = user
			this.list.push(user)
			this.appended.notify(user)
		}
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
		user : `ui.User`
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
	}
})

ui.UserList.View = Class.extend({
	init: function(model){
		this.model = model
		
		this.node = $("<div>")
			.addClass("user_list")
			.addClass("visual_container")
			.scroll(this._handle_view_change.bind(this))
			.keydown(this._handle_keydown.bind(this))
		
		$(window).resize(this._handle_view_change.bind(this))
		
		this.model.appended.attach(this._handle_append.bind(this))
		this.model.cleared.attach(this._handle_clear.bind(this))
		this.model.user_selected.attach(this._handle_user_select.bind(this))
		
		this.view_changed = new Event(this)
		this.keypressed    = new Event(this)
		
		for(var i=0;i<this.model.list;i++){
			var user = this.model.list[i]
			this._append_user(user)
		}
	},
	_handle_append: function(_, user){
		this._append(user)
	},
	_handle_clear: function(){
		this.node.html("")
	},
	_handle_user_select: function(_, user){
		this._show_user(user)
	},
	_handle_view_change: function(){
		this.view_changed.notify()
	},
	_handle_keydown: function(e){
		this.keypressed.notify(e)
	},
	loading: function(loading){
		if(loading === undefined){
			return this.node.hasClass("loading")
		}else{
			if(loading){
				this.node.addClass("loading")
			}else{
				this.node.removeClass("loading")
			}
		}
	},
	view: function(){
		return {
			top: this.node.scrollTop(),
			bottom: this.node.scrollTop()+this.node.height(),
			end: this.node[0].scrollHeight
		}
	},
	_append: function(user){
		this.node.append(user.node)
	},
	_show_user: function(user){
		if(user){
			if(user.top() < 25){
				this.node.scrollTop(this.node.scrollTop() + user.top() - 25)
			}else if(user.bottom() + 25 > this.node.height()){
				this.node.scrollTop(this.node.scrollTop() + (user.bottom() - this.node.height()) + 25)
			}
		}
	}
})

