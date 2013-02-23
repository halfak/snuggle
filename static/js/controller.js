Controller = Class.extend({
	init: function(local, mediawiki){
		this.local     = local
		this.mediawiki = mediawiki
		
		this.users_query = null
		
		//Snuggler
		this.snuggler = new View.Snuggler(new Model.Snuggler())
		$("#status").after(this.snuggler.node)
		this._load_snuggler()
		
		this.snuggler.menu.login.login.clicked.attach(this._login_snuggler.bind(this))
		this.snuggler.menu.logout.logout.clicked.attach(this._logout_snuggler.bind(this))
		
		
		//Controls
		this.controls = new View.Controls()
		$("body").append(this.controls.node)
		
		this.controls.changed.attach(function(_, filters){
			this._update_query(filters)
		}.bind(this))
		
		//User list
		this.list = new View.UserList(new Model.UserList())
		$("body").append(this.list.node)
		
		this.list.user_clicked.attach(function(_, user){
			if(this.list.model.select(user.model)){
				this.add_view(user.model)
			}
		}.bind(this))
		this.list.user_categorized.attach(this._categorize_user.bind(this))
		this.list.view_changed.attach(this._fill_list.bind(this))
		
		this.list.action_submitted.attach(this._user_action.bind(this))
		this.list.action_loaded.attach(this._user_action_preview.bind(this))
		this.list.action_changed.attach(this._user_action_preview_timeout.bind(this))
		
		this._update_query(this.controls.val())
		
		//Handle key presses
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
		}else if(e.which == KEYS.NUM_1 || e.which == KEYS.NUM_PAD_1){
			if(this.list.selected()){
				var user = this.list.selected()
				this._categorize_user(user, "good-faith")
			}
		}else if(e.which == KEYS.NUM_2 || e.which == KEYS.NUM_PAD_2){
			if(this.list.selected()){
				var user = this.list.selected()
				this._categorize_user(user, "ambiguous")
			}
		}else if(e.which == KEYS.NUM_3 || e.which == KEYS.NUM_PAD_3){
			if(this.list.selected()){
				var user = this.list.selected()
				this._categorize_user(user, "bad-faith")
			}
		}else{
			return true
		}
	},
	_append_users: function(users){
		this.list.model.append(users)
	},
	_update_query: function(filters){
		//initialize query
		this.users_query = this.local.users.query(filters)
		
		//Clear list
		this.list.model.clear()
		
		this._fill_list()
		
	},
	_fill_list: function(_, view){
		view = view || this.list.view()
		
		if(view.end - view.bottom < 200 && !this.loading){
			//console.log(view)
			this._load_users()
		}
	},
	_load_users: function(){
		if(!this.users_query.complete){
			this.loading = true
			this.list.model.loading(true)
			this.users_query.next(
				10,
				function(query, users){
					this.list.model.loading(false)
					this.loading = false
					if(query.filters == this.users_query.filters){ //If we are still running the same query
						this._append_users(users)
					}
					this._fill_list()
				}.bind(this),
				function(message){
					this.list.model.loading(false)
					this.loading = false
					alert(message)
				}.bind(this)
			)
		}
	},
	_categorize_user: function(_, user, category){
		if(!user){return}
		user.category.disabled(true)
		this.local.users.categorize(
			user.model, category,
			function(response){
				if(response){
					user.category.disabled(false)
					user.model.category.update(
						response.category.current, 
						response.category.history
					)
				}
				user = this.list.model.shift_selection(1)
				this.add_view(user)
			}.bind(this),
			function(message, doc, meta){
				doc = doc || {}
				if(doc.code == "permissions"){
					alert("You must be logged in to rate newcomers.")
					this.snuggler.menu.expanded(true)
				}else{
					alert(message)
				}
				user.category.disabled(false)
			}.bind(this)
		)
	},
	_load_snuggler: function(){
		this.local.snuggler.status(
			function(doc){
				if(doc.logged_in){
					this.snuggler.model.set(doc.user.id, doc.user.name)
				}else{
					this.snuggler.model.clear()
				}
			}.bind(this),
			function(message, doc){
				alert(message)
			}.bind(this)
		)
	},
	_login_snuggler: function(){
		if(this.snuggler.menu.login.name.val().length > 0){
			this.snuggler.menu.login.disabled(true)
			this.local.snuggler.authenticate(
				this.snuggler.menu.login.name.val(),
				this.snuggler.menu.login.pass.val(),
				function(doc){
					this.snuggler.model.set(doc.id, doc.name)
					this.snuggler.menu.login.clear()
					this.snuggler.menu.login.disabled(false)
					this.snuggler.menu.expanded(false)
					
					//Update any previews that are waiting.
					if(this._waiting_action_view){
						if(this._waiting_action_view.action.selected()){
							this._user_action_preview(
								{},
								this._waiting_action_view.user_view,
								this._waiting_action_view.action
							)
						}
						this._waiting_action_view = null
					}
				}.bind(this),
				function(message, doc, meta){
					if(doc && doc.code && doc.code == "authentication"){
						if(meta.type == "password"){
							alert("Could not log in.  Password incorrect.")
						}else if(meta.type == "username"){
							alert("Could not log in.  No user by the name '" + this.snuggler.menu.login.name.val() + "'.")
						}else if(meta.type == "connection"){
							alert("Could not log in.  Connection to " + SYSTEM.wiki.root + " failed.")
						}else{
							alert(message)
						}
					}else{
						alert(message)
					}
					this.snuggler.menu.login.disabled(false)
				}.bind(this)
			)
		}else{
			alert("You must specify a username in order to log in.")
		}
	},
	_user_action: function(_, user_view, action, watch){
		
		user_view.info.menu.disabled(true)
		
		this.local.users.action(
			user_view.model,
			action,
			function(doc){
				user_view.info.menu.disabled(false)
				action.reset()
				user_view.info.menu.expanded(false)
				//TODO confirm to user that action was completed.
			},
			function(message, doc){
				doc = doc || {}
				if(doc.code == "permissions"){
					alert("You must be logged in to Snuggle perform actions.")
					this.snuggler.menu.expanded(true)
				}else{
					alert(message)
				}
				user_view.info.menu.disabled(false)
			}
		)
		
		//TODO: This is just sort of tacked on here.  
		if(watch){
			this.local.users.watch(
				user_view.model,
				function(doc){
					//nothing to do
				},
				function(message, doc){
					doc = doc || {}
					if(doc.code == "permissions"){
						alert("You must be logged in to Snuggle perform actions.")
						this.snuggler.menu.expanded(true)
					}else{
						alert(message)
					}
				}
			)
		}
		
	},
	_user_action_preview: function(_, user_view, action){
		this.local.users.preview_action(
			user_view.model,
			action,
			function(html){
				user_view.info.menu.menu.flyout.load_preview(action, html)
			},
			function(message, doc){
				if(doc.code == "permissions"){
					user_view.info.menu.menu.flyout.load_preview(
						action, 
						'<div class="error">You must be logged in to Snuggle perform actions.</div>'
					)
					this.snuggler.menu.expanded(true)
					this._waiting_action_view = {action: action, user_view: user_view}
				}else{
					alert(message)
				}
			}
		)
	},
	_user_action_preview_timeout: function(_, user_view, action){
		if(this.action_preview){
			clearTimeout(this.action_preview)
		}
		this.action_preview = setTimeout(
			function(){
				this._user_action_preview({}, user_view, action)
			}.bind(this),
			500
		)
	},
	_logout_snuggler: function(){
		this.snuggler.menu.logout.disabled(true)
		this.local.snuggler.log_out(
			function(doc){
				this.snuggler.model.clear()
				this.snuggler.menu.logout.disabled(false)
				this.snuggler.menu.expanded(false)
			}.bind(this),
			function(message, doc){
				alert(message)
				this.snuggler.menu.logout.disabled(false)
			}.bind(this)
		)
	}
	
})
