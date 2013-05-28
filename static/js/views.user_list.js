views = window.views || {}


views.UserList = Class.extend({
	init: function(model){
		this.model = model
		
		this.node = $("<div>")
			.addClass("user_list")
			.scroll(this._handle_view_change.bind(this))
			.resize(this._handle_view_change.bind(this))
		
		this.model.appended.attach(this._handle_append.bind(this))
		this.model.cleared.attach(this._handle_clear.bind(this))
		this.model.loading_changed.attach(this._handle_loading_change.bind(this))
		this.model.user_selected.attach(this._handle_user_select.bind(this))
		
		this.view_changed = new Event(this)
		this.keypressed   = new Event(this)
		
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
	_handle_loading_change: function(){
		if(this.model.loading()){
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
	_append: function(user){
		this.node.append(user.node)
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
