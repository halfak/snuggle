ui = window.ui || {}

ui.User = Class.extend({
		
	init: function(model, view){
		this.model = model || new ui.User.Model()
		this.view  = view || new ui.User.View(this.model)
		this.id    = this.model.id
		this.name  = this.model.name
		this.node  = this.view.node
		
		this.view.focus_set.attach(this._handle_focus.bind(this))
		this.view.keypressed.attach(this._handle_keypress.bind(this))
		this.view.info.actions.submitted.attach(this._handle_action_submitted.bind(this))
		this.view.info.actions.loaded.attach(this._handle_action_loaded.bind(this))
		
		this.model.selected_changed.attach(this._handle_selected_change.bind(this))
		
		SNUGGLE.snuggler.changed.attach(this._handle_snuggler_change.bind(this))
		
		this.permissions_error = new Event(this)
		this.focussed          = new Event(this)
		this.selected_changed  = new Event(this)
	},
	_handle_keypress: function(_, e){
		if(this.view.focused()){
			logger.debug("Capturing keypress for user name=" + this.model.name + ": " + e.which)
			switch(e.which){
				case env.keys.NUM_1:
				case env.keys.NUM_PAD_1:
					this.view.info.category.val("good-faith")
					util.kill_event(e)
					break
				case env.keys.NUM_2:
				case env.keys.NUM_PAD_2:
					this.view.info.category.val("ambiguous")
					util.kill_event(e)
					break
				case env.keys.NUM_3:
				case env.keys.NUM_PAD_3:
					this.view.info.category.val("bad-faith")
					util.kill_event(e)
					break
				case env.keys.UP_ARROW:
					this.view.activity.grid.shift_cursor(0, 1)
					util.kill_event(e)
					break
				case env.keys.RIGHT_ARROW:
					this.view.activity.grid.shift_cursor(1, 0)
					util.kill_event(e)
					break
				case env.keys.DOWN_ARROW:
					this.view.activity.grid.shift_cursor(0, -1)
					util.kill_event(e)
					break
				case env.keys.LEFT_ARROW:
					this.view.activity.grid.shift_cursor(-1, 0)
					util.kill_event(e)
					break
				case env.keys.ESCAPE:
					this.view.activity.grid.clear_cursor()
					break
				default:
					return true
			}
			return false
		}
	},
	_handle_focus: function(){
		this.focussed.notify(true)
	},
	_handle_selected_change: function(){
		this.selected_changed.notify(this.model.selected())
	},
	_handle_action_submitted: function(_, action, watch){
		if(!SNUGGLE.snuggler.authenticated()){
			SNUGGLE.snuggler.ping()
		}else{
			// Disable user_actions.  No clicky clicky.
			this.view.info.actions.disabled(true)
			servers.local.users.perform_action(
				this.model,
				action,
				watch,
				function(doc){
					this.view.info.actions.disabled(false)
					action.reset()
					this.view.info.actions.expanded(false)
					this._reload_user_talk()
				}.bind(this),
				function(message, doc, meta){
					doc = doc || {}
					if(doc.code == "permissions"){
							logger.error("Permissions error while trying to perform a user action.")
							this.permissions_error.notify()
					}else{
							alert(message)
					}
					this.view.info.actions.disabled(false)
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
	add_view: function(){
		this.model.add_view()
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
ui.User.from_doc = function(doc){
	return new ui.User(new ui.User.Model(doc))
}
