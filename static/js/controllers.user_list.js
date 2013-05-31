controllers = window.controllers || {}

controllers.UserList = Class.extend({
	
	init: function(){
		this.model = new models.UserList()
		this.view  = new views.UserList(this.model)
		this.node = this.view.node
		
		this.query = null
		this.selected = null
		
		this.view.view_changed.attach(this._handle_view_change.bind(this))
		this.view.keypressed.attach(this._handle_keypress.bind(this))
	},
	_handle_view_change: function(_, view){
		this._read_until_full()
	},
	_handle_user_focus: function(user){
		this.model.select(user)
		if(this._view_delay){
			clearTimeout(this._view_delay)
		}
		this._view_delay = setTimeout(
			function(){
				logger.
				servers.local.users.view(
					user,
					function(doc){
						this.model.add_view()
					}.bind(this),
					function(error){
						LOGGING.error(error)
					}
				)
			}.bind(this),
			delays.user_view_delay * 1000
		)
	},
	_handle_keypress: function(_, e){
		if(e.which == keys.PAGE_UP){
			this.model.shift_selection(-1)
			util.kill_event(e)
		}else if(e.which == keys.PAGE_DOWN){
			this.model.shift_selection(1)
			util.kill_event(e)
		}
	},
	append: function(user){
		user.focussed.attach(this._handle_user_focus.bind(this))
		this.model.append(user)
	},
	load: function(query){
		//initialize query
		this.query = query
		
		//Clear list
		this.model.clear()
		
		this._read_until_full()
		
	},
	_read_until_full: function(){
		// This function checks to see if we should load
		if(!this.query.complete){
			view = this.view.view()
			
			if(view.end - view.bottom < 200 && !this.model.loading()){
				logger.debug("Time to load more results!")
				this._load_more_users()
			}
		}
	},
	_load_more_users: function(){
		if(!this.query.complete){
			logger.debug("Sending a request for more users.")
			this.model.loading(true)
			this.query.next(
				10,
				function(query, docs){
					this.model.loading(false)
					if(query == this.query){ //If we are still running the same query
						for(var i=0;i<docs.length;i++){
							this.append(new controllers.User(docs[i]))
						}
					}
					this._read_until_full()
				}.bind(this),
				function(message){
					this.model.loading(false)
					alert(message)
				}.bind(this)
			)
		}
	}
})