controllers = window.controllers || {}

controllers.User = Class.extend({
		
	init: function(doc){
		this.model = new models.User(doc)
		this.view  = new views.User(this.model)
		this.id    = this.model.id
		this.node  = this.view.node
		
		this.view.focussed.attach(this._handle_focus.bind(this))
		this.view.keypressed.attach(this._handle_keypress.bind(this))
		this.view.info.category.changed.attach(this._handle_category_changed.bind(this))
		this.view.info.actions.submitted.attach(this._handle_action_submitted.bind(this))
		this.view.info.actions.loaded.attach(this._handle_action_loaded.bind(this))
		
		
		SNUGGLE.snuggler.changed.attach(this._handle_snuggler_change.bind(this))
		
		this.model.selected_changed.attach(this._handle_selected_change.bind(this))
		
		this.permissions_error = new Event(this)
		this.focussed          = new Event(this)
	},
	_handle_keypress: function(_, e){
		logger.debug("Capturing keypress for user name=" + this.model.name + ": " + e.which)
		switch(e.which){
			case keys.NUM_1:
			case keys.NUM_PAD_1:
				this.view.category.category.val("good-faith")
				util.kill_event(e)
				break
			case keys.NUM_2:
			case keys.NUM_PAD_2:
				this.view.category.category.val("ambiguous")
				util.kill_event(e)
				break
			case keys.NUM_3:
			case keys.NUM_PAD_3:
				this.view.category.category.val("bad-faith")
				util.kill_event(e)
				break
			case keys.UP_ARROW:
				this.view.activity.grid.shift_cursor(0, 1)
				util.kill_event(e)
				break
			case keys.RIGHT_ARROW:
				this.view.activity.grid.shift_cursor(1, 0)
				util.kill_event(e)
				break
			case keys.DOWN_ARROW:
				this.view.activity.grid.shift_cursor(0, -1)
				util.kill_event(e)
				break
			case keys.LEFT_ARROW:
				this.view.activity.grid.shift_cursor(-1, 0)
				util.kill_event(e)
				break
			case keys.ESCAPE:
				this.view.activity.grid.clear_cursor()
				break
			default:
				return true
		}
		return false
	},
	_handle_focus: function(){
		this.focussed.notify(true)
	},
	_handle_selected_change: function(){
		if(this.selected()){
			if(this._view_delay){
				clearTimeout(this._view_delay)
			}
			this._view_delay = setTimeout(
				function(){
					SYSTEM.local.users.view(
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
		}
	},
	_handle_category_changed: function(){
		if(!SNUGGLE.snuggler.authenticated()){
			SNUGGLE.snuggler.ping()
		}else{
			this.view.category.disabled(true)
			servers.local.users.categorize(
				this.model, this.view.category.val(),
				function(doc){
					if(doc){
						this.model.category.load_doc(doc)
						this.view.category.disabled(false)
					}
				}.bind(this),
				function(message, doc, meta){
					if(doc.code == "permissions"){
							logger.error("Permissions error while trying to change category.")
							this.permissions_error.notify()
					}else{
							alert(message)
					}
					this.view.category.disabled(false)
				}.bind(this)
			)
		}
	},
	_handle_action_submitted: function(_, action, watch){
		if(!SNUGGLE.snuggler.authenticated()){
			SNUGGLE.snuggler.ping()
		}else{
			// Disable user_actions.  No clicky clicky.
			this.view.info.user_actions.disabled(true)
			servers.local.users.perform_action(
				this.model,
				action,
				watch,
				function(doc){
					this.view.info.menu.disabled(false)
					action.reset()
					this.view.info.menu.expanded(false)
					this._reload_user_talk(user)
				}.bind(this),
				function(message, doc, meta){
					doc = doc || {}
					if(doc.code == "permissions"){
							logger.error("Permissions error while trying to perform a user action.")
							this.permissions_error.notify()
					}else{
							alert(message)
					}
					user_view.info.menu.disabled(false)
				}.bind(this)
			)
		}
	},
	_handle_action_loaded: function(){
		if(!SNUGGLE.snuggler.authenticated()){
			SNUGGLE.snuggler.ping()
		}
	},
	_handle_snuggler_change: function(){
		this.view.info.actions.menu.load_preview()
	},
	_reload_user_talk: function(){
		if(!SNUGGLE.snuggler.authenticated()){
			SNUGGLE.snuggler.ping()
		}else{
			servers.local.users.reload_talk(
					this.model,
					function(doc){
						var talk = this.model.talk.load_doc(doc)
					}.bind(this),
					function(message, doc, meta){
						doc = doc || {}
						if(doc.code == "permissions"){
								logger.error("Permissions error while trying to reload talk.")
								this.permissions_error.notify()
						}else{
								alert(message)
						}
					}.bind(this)
			)
		}
	},
	selected: function(selected){
		return this.model.selected(selected)
	},
	in_document: function(){
		return $(document, this.view.node[0])
	},
	set_index: function(index){
		this.view.set_index(index)
	},
	top: function(){
		return this.view.top()
	},
	bottom: function(){
		return this.view.bottom()
	},
	height: function(){
		return this.view.height()
	}
})
