ui = window.ui || {}

ui.UserContainer = ui.Dropper.extend({
	init: function(user, container_node){
		this.user = user
		this.container_node = $(window)
		
		this._super({label: user.name})
		this.node.addClass("user_container")
		
		this.changed.attach(this._handle_dropper_change.bind(this))
		
		$(window).resize(this._handle_window_resize.bind(this))
		
		this.loaded = false
	},
	_handle_dropper_change: function(){
		if(this.expanded()){
			this._load_user_info()
		}
		this._update_position()
	},
	_handle_window_resize: function(){
		this._update_position()
	},
	_update_position: function(){
		if(this.expanded()){
			container_node = this.node.closest(".visual_container")
			
			this.pane.node.css(
				'width',
				Math.max(container_node.innerWidth() - 35)
			)
			
			this.pane.node.css(
				'left',
				((this.tab.node.offset().left - container_node.offset().left)*-1)+12
			)
		}
	},
	_load_user_info: function(){
		if(!this.loaded){
			servers.local.users.get(
				this.user,
				function(doc){
					this.user = ui.User.from_doc(doc)
					this.user.selected(true)
					this.set_content(this.user.node)
					this.loaded = true
				}.bind(this),
				function(message, doc, meta){
					logger.error(message)
					alert(message)
				}.bind(this)
			)
		}
	}
})
