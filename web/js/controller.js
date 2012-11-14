Controller = Class.extend({
	init: function(local, mediawiki){
		this.local     = local
		this.mediawiki = mediawiki
		
		this.users_query = null
		
		this.controls = new View.Controls()
		$("body").append(this.controls.node)
		
		this.list = new View.UserList(new Model.UserList())
		$("body").append(this.list.node)
		
		this.list.user_clicked.attach(function(_, user){
			if(this.list.model.select(user.model)){
				this.add_view(user.model)
			}
		}.bind(this))
		
		this.list.view_changed.attach(this._fill_list.bind(this))
		
		this.controls.changed.attach(function(_, filters){
			this._update_query(filters)
		}.bind(this))
		
		this._update_query(this.controls.val())
		
		$(window).keydown(this._handle_keydown.bind(this))
		
		this.loading = false
	},
	add_view: function(user){
		if(this.view){
			clearTimeout(this.view)
		}
		if(user){
			this.view = setTimeout(
				function(){
					this.local.users.view(
						user,
						function(doc){
							user.add_view()
						}.bind(this),
						function(error){
							LOGGING.error(error)
						}
					)
				}.bind(this),
				1500
			)
		}
	},
	_handle_keydown: function(e){
		if(e.which == KEYS.PAGE_DOWN){
			var user = this.list.model.shift_selection(1)
			this.add_view(user)
			return false
		}else if(e.which == KEYS.PAGE_UP){
			var user = this.list.model.shift_selection(-1)
			this.add_view(user)
			return false
		}else{
			return true
		}
	},
	_append_users: function(users){
		this.list.model.append(users)
	},
	_update_query: function(filters){
		//Clear list
		this.list.model.clear()
		
		//initialize query
		this.users_query = this.local.users.query(filters)
		
		this._fill_list()
		
	},
	_fill_list: function(_, view){
		view = view || this.list.view()
		
		if(view.end - view.bottom < 200 && !this.loading){
			console.log(view)
			this._load_users()
		}
	},
	_load_users: function(){
		if(!this.users_query.complete){
			this.loading = true
			this.list.model.loading(true)
			this.users_query.next(
				10,
				function(users){
					this.list.model.loading(false)
					this._append_users(users)
					this.loading = false
					this._fill_list()
				}.bind(this),
				function(message){
					this.list.model.loading(false)
					this.loading = false
					alert(message)
				}.bind(this)
			)
		}
	}
})
