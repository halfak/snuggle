ui.Snuggle = Class.extend({
	init: function(){
		this.node = $("body")
		
		logger.info("ui.snuggle: loading...")
		
		// Set up help
		this.help = new ui.HelpSlider(configuration.i18n.lang)
		this.node.append(this.help.node)
		
		// Set up snuggler
		this.snuggler = new ui.Snuggler()
		$("#status").after(this.snuggler.node)
		
		// Set up user browser
		this.user_browser = new ui.UserBrowser()
		this.node.append(this.user_browser.node)
			
		// Set up event browser
		this.event_browser = new ui.EventBrowser()
		this.node.append(this.event_browser.node)
	},
	_handle_filter_menu_change: function(_){
		logger.debug("ui.snuggle: controller delaying filter change.")
		if(this.filters_change_delay){
			clearTimeout(this.filters_change_delay)
		}
		
		this.filters_change_delay = setTimeout(
			this._update_query.bind(this), 
			delays.update_user_filters
		)
	},
	_update_query: function(){
		logger.debug("ui.snuggle: updating query")
		var query = servers.local.users.query(this.filter_menu.val())
		this.user_list.load(query)
	}
})


