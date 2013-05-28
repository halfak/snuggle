ui.Snuggle = Class.extend({
	init: function(local, mediawiki){
		this.local = local
		this.mediawiki = mediawiki
		
		this.node = $("body")
		
		// Set up snuggler
		this.snuggler = new controller.Snuggler()
		$("#status").after(this.snuggler.node)
		this._load_snuggler()
		
		// Set up filters
		this.filter_menu = new ui.FilterMenu()
		this.filter_menu.changed.attach(this._handle_filter_menu_change)
		this.node.append(this.controls.node)
		
		// Set up user list
		this.user_list = new controllers.UserList()
		this.node.append(this.user_list.node)
		
		this._update_query(null, this.filter_menu.filters())
		
		//Handle key presses
		$(window).keydown(this._handle_keydown.bind(this))
		
		this.loading = false
	},
	_handle_filter_menu_change: function(_){
		logger.debug("controller delaying filter change.")
		if(this.filters_change_delay){
			clearTimeout(this.filters_change_delay)
		}
		
		this.filters_change_delay = setTimeout(
			this._update_query.bind(this), 
			SNUGGLE.ui.filter_delay * 1000
		)
	},
	_update_query: function(){
		var query = this.local.users.query(this.filter_menu.val())
		this.user_list.load(query)
	}
})
