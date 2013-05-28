models = window.models || {}

/** 
Represents a list of `models.User`.  Users can be appended to the end.  This 
model keeps track of a single selection.  The selection can be shifted (see 
`shift_selection(<delta>)`) or a user can be selected directly (see 
`select(<controllers.User>)`).  Also a user can be found for using (get_user(<id>))
*/
models.UserList = Class.extend({
	/**
	:Parameters:
		users : [controllers.User]
			(Optional) a list of `models.User`s to load
	 */
	init: function(){
		this.list = []
		this.map = {}
		
		this.appended          = new Event(this)
		this.cleared           = new Event(this)
		this.user_selected     = new Event(this)
		this.loading_changed   = new Event(this)
		
		this.loading.status = false
		
		this.clear_selection()
	},
	
	/**
	Sets or gets the status of loading.
	
	:Parameters:
		loading : Boolean
			should the status be set to loading or not?
	*/
	loading: function(loading){
		if(loading === undefined){
			return this.loading.status
		}else{
			var old_val = this.loading.status
			this.loading.status = Boolean(loading)
			
			if(this.loading.status != old_val){
				this.loading_changed.notify(this.loading.status)
			}
		}
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
		user : `controllers.User`
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
