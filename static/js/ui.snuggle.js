ui.Snuggle = Class.extend({
	init: function(){
		this.node = $("body")
		
		logger.info("Starting up Snuggle UI.")
		
		// Set up help
		this.help = new ui.HelpSlider(configuration.i18n.lang)
		this.node.append(this.help.node)
		
		// Perform initial query automatically
		//this._load_help()
		
		// Set up snuggler
		this.snuggler = new controllers.Snuggler()
		$("#status").after(this.snuggler.node)
		
		// Set up filters
		this.filter_menu = new ui.FilterMenu()
		this.filter_menu.changed.attach(this._handle_filter_menu_change.bind(this))
		this.node.append(this.filter_menu.node)
		
		// Set up user list
		this.user_list = new controllers.UserList()
		this.node.append(this.user_list.node)
		
		// Perform initial query automatically
		this._update_query()
		
		this.loading = false
	},
	_handle_filter_menu_change: function(_){
		logger.debug("ui.snuggle: controller delaying filter change.")
		if(this.filters_change_delay){
			clearTimeout(this.filters_change_delay)
		}
		
		this.filters_change_delay = setTimeout(
			this._update_query.bind(this), 
			delays.update_filters
		)
	},
	_load_help: function(){
		logger.debug("ui.snuggle: loading help content")
		servers.local.help(
			configuration.i18n.lang,
			function(content){
				console.log($(content).html())
				this.help.load_content()
			}.bind(this),
			function(message, doc, meta){
				alert(message)
			}.bind(this)
		)
	},
	_update_query: function(){
		logger.debug("ui.snuggle: updating query")
		var query = servers.local.users.query(this.filter_menu.val())
		this.user_list.load(query)
	}
})
