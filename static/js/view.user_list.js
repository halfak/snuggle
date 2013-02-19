View = window.View || {}


View.UserList = Class.extend({
	init: function(model){
		this.model = model
		
		this.users = {}
		
		this.last_view_change = null
		
		this.node = $("<div>")
			.addClass("user_list")
			.scroll(this._handle_view_change.bind(this))
			.resize(this._handle_view_change.bind(this))
		
		this._appended(null, model.list)
		
		this.model.appended.attach(this._appended.bind(this))
		this.model.cleared.attach(this._cleared.bind(this))
		this.model.is_loading.attach(this._is_loading.bind(this))
		this.model.user_selected.attach(this._show_user.bind(this))
		
		this.view_changed      = new Event(this)
		this.user_clicked      = new Event(this)
		this.user_categorized  = new Event(this)
		this.action_changed    = new Event(this) //TODO: Not
		this.action_loaded     = new Event(this) //TODO: quite
		this.action_submitted  = new Event(this) //TODO: sure about this
	},
	/**
	Generates the ranges of the current view pane.
	*/
	view: function(){
		return {
			top: this.node.scrollTop(),
			bottom: this.node.scrollTop()+this.node.height(),
			end: this.node[0].scrollHeight
		}
	},
	/**
	Gets the selected user if there is one.
	*/
	selected: function(){
		if(this.model.select()){
			return this.users[this.model.select().id]
		}else{
			return null
		}
	},
	_show_user: function(_, user){
		var user = this.users[user.id]
		var view = this.view()
		
		if(user){
			if(user.top() < 25){
				this.node.scrollTop(this.node.scrollTop() + user.top() - 25)
			}else if(user.bottom() + 25 > this.node.height()){
				this.node.scrollTop(this.node.scrollTop() + (user.bottom() - this.node.height()) + 25)
			}
		}
	},
	_handle_view_change: function(e){
		this.view_changed.notify(this.view())
	},
	_appended: function(_, users){
		for(var i=0;i<users.length;i++){
			var user_view = new View.User(users[i])
			user_view.clicked.attach(
				function(user_view){
					this.user_clicked.notify(user_view)
				}.bind(this)
			)
			user_view.categorized.attach(
				function(user_view, category){
					this.user_categorized.notify(user_view, category)
				}.bind(this)
			)
			user_view.action_submitted.attach(
				function(user_view, action, watch){
					this.action_submitted.notify(user_view, action, watch)
				}.bind(this)
			)
			user_view.action_loaded.attach(
				function(user_view, action){
					this.action_loaded.notify(user_view, action)
				}.bind(this)
			)
			user_view.action_changed.attach(
				function(user_view, action){
					this.action_changed.notify(user_view, action)
				}.bind(this)
			)
			this.node.append(user_view.node)
			this.users[user_view.model.id] = user_view
		}
	},
	_cleared: function(){
		this.node.children().remove()
	},
	_is_loading: function(_, loading){
		if(loading){
			this.node.addClass("loading")
		}else{
			this.node.removeClass("loading")
		}
	}
})
