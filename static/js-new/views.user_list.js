views = window.views || {}


views.UserList = Class.extend({
	init: function(model){
		this.model = model
		
		this.node = $("<div>")
			.addClass("user_list")
			.scroll(this._handle_view_change.bind(this))
			.resize(this._handle_view_change.bind(this))
		
		this._appended(null, model.list)
		
		this.model.appended_user.attach(this._hanlde_append_user.bind(this))
		this.model.cleared.attach(this._hanlde_clear.bind(this))
		this.model.status_changed.attach(this._handle_status_change.bind(this))
		this.model.user_selected.attach(this._handle_user_select.bind(this))
		
		this.view_changed = new Event(this)
		this.keypressed   = new Event(this)
	},
	_handle_append_user: function(_, user){
		this.node.append(user.node)
	},
	_handle_cleare: function(){
		this.node.html("")
	},
	_handle_status_change: function(){
		if(this.model.loading){
			this.node.addClass("loading")
		}else{
			this.node.removeClass("loading")
		}
	},
	_handle_user_select: function(user){
		this._show_user(user)
	},
	_handle_view_change: function(){
		this.view_changed.notify()
	},
	_handle_keypress: function(e){
		this.keypressed.notify(e.which)
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
	_show_user: function(_, user){
		if(user){
			if(user.top() < 25){
				this.node.scrollTop(this.node.scrollTop() + user.top() - 25)
			}else if(user.bottom() + 25 > this.node.height()){
				this.node.scrollTop(this.node.scrollTop() + (user.bottom() - this.node.height()) + 25)
			}
		}
	}
})
