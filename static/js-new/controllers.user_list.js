controllers = window.controllers || {}

controllers.UserList = Class.extend({
	
	init: function(){
		this.model = models.UserList()
		this.view  = views.UserList(this.model)
		
		this.query = null
		this.selected = null
		
		this.view.view_changed.attach(this._handle_view_change.bind(this))
		this.view.keypressed.attach(this._handle_keypress.bind(this))
		
		this.append(users)
	},
	_handle_view_change: function(_, view){
		this._read_until_full()
	},
	_handle_user_clicked: function(user){
		this.model.select(user)
	},
	_handle_keypress: function(_, which){
		if(which == keys.PAGE_UP){
			this.model.shift_selection(-1)
			e.stopPropagation()
		}else if(which == keys.PAGE_DOWN){
			this.model.shift_selection(1)
			e.stopPropagation()
		}
	},
	append: function(user){
		user.clicked.attach(this._handle_user_clicked.bind(this))
		this.model.append(user)
	},
	load: function(query){
		//initialize query
		this.query = query
		
		//Clear list
		this.list.model.clear()
		
		this._read_until_full()
		
	},
	_read_until_full: function(){
		// This function checks to see if we should load
		if(!this.query.complete){
			view = this.view.view()
			
			if(view.end - view.bottom < 200 && !this.loading){
				logger.debug("Time to load more results!")
				this._load_users()
			}
		}
	},
	_load_users: function(){
		if(!this.users_query.complete){
			this.model.loading(true)
			this.users_query.next(
				10,
				function(query, docs){
					this.model.loading(false)
					if(query == this.query){ //If we are still running the same query
						for(var i=0;i<docs.length;i++){
							this.append(new contoller.User(d, i))
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
