ui = window.ui || {}

ui.UserBrowser = Class.extend({
	init: function(){
		this.node = $("<div>")
			.addClass("user_browser")
		
		// Set up filters
		this.user_filters = new ui.UserFilters()
		this.user_filters.changed.attach(this._handle_filter_menu_change.bind(this))
		this.node.append(this.user_filters.node)
		
		// Set up user list
		this.user_list = new ui.UserList()
		this.node.append(this.user_list.node)
		
		this.loaded = false
	},
	_handle_filter_menu_change: function(_){
		logger.debug("ui.snuggle: controller delaying filter change.")
		if(this.filters_change_delay){
			clearTimeout(this.filters_change_delay)
		}
		
		this.filters_change_delay = setTimeout(
			this._update_cursor.bind(this), 
			env.delays.update_cursor
		)
	},
	visible: function(visible){
		if(visible === undefined){
			return this.node.css("display") != "none"
		}else{
			if(visible){
				this.node.show()
			}else{
				this.node.hide()
			}
		}
	},
	load: function(){
		if(!this.loaded){
			logger.info("ui.user_browser: loading...")
			this._update_cursor()
			this.loaded = true
		}
	},
	_update_cursor: function(){
		logger.debug("ui.user_browser: updating cursor...")
		var cursor = servers.local.users.cursor(this.user_filters.val())
		this.user_list.load(cursor)
	}
})
