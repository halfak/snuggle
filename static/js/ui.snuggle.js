ui.Snuggle = Class.extend({
	init: function(){
		
		this.node = $("body")
		
		// Set up help
		this.help = new ui.HelpSlider()
		this.node.append(this.help)
		
		// Perform initial query automatically
		this._load_help()
		
		// Set up snuggler
		this.snuggler = new controllers.Snuggler()
		$("#status").after(this.snuggler.node)
		
		// Set up filters
		this.filter_menu = new ui.FilterMenu()
		this.filter_menu.changed.attach(this._handle_filter_menu_change)
		this.node.append(this.filter_menu.node)
		
		// Set up user list
		this.user_list = new controllers.UserList()
		this.node.append(this.user_list.node)
		
		// Perform initial query automatically
		this._update_query()
		
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
	_load_help: function(){
		servers.local.help(
			configuration.snuggle.ui.help,
			function(content){
				this.help.load_content($(content).find("help_content").html())
			}.bind(this),
			function(message, doc, meta){
				alert(message)
			}.bind(this)
		)
	},
	_update_query: function(){
		logger.debug("snuggle updating query")
		var query = servers.local.users.query(this.filter_menu.val())
		this.user_list.load(query)
	}
})
