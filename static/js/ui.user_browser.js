ui.UserBrowser = Class.extend({
	init: function(){
		this.node = $("<div>")
			.addClass("user_browser")
		
		logger.info("ui.user_browser: loading...")
		
		// Set up help
		this.help = new ui.UserBrowser.Help(configuration.i18n.lang)
		this.node.append(this.help.node)
		
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
			delays.update_user_filters
		)
	},
	_update_query: function(){
		logger.debug("ui.snuggle: updating query")
		var query = servers.local.users.query(this.filter_menu.val())
		this.user_list.load(query)
	}
})

ui.UserBrowser.Help = Class.extend({
	init: function(lang){
		this.lang = lang
		
		this.node = $("<div>")
			.addClass("help_slider")
			.click(util.stop_propagation)
		
		this.pane = {
			node: $("<div>")
				.addClass("pane")
				.append(
					$("<div>").addClass("container")
						.load("help/" + this.lang + ".html .help_content")
				)
		}
		this.node.append(this.pane.node)
		
		this.tab = {
			node: $("<div>")
				.addClass("tab")
				.addClass("clickable")
				.append($("<span>").html(i18n.get("help")))
		}
		this.node.append(this.tab.node)
		this.tab.node.click(this._handle_click.bind(this))
		
		$("body").click(this._handle_body_click.bind(this))
	},
	_handle_click: function(){
		this.toggle()
	},
	_handle_body_click: function(e){
		this.expanded(false)
	},
	toggle: function(){
		this.expanded(!this.expanded())
	},
	expanded: function(expand){
		if(expand === undefined){
			return this.node.hasClass("expanded")
		}else{
			if(expand){
				this.pane.node.animate(
					{"height": "400px"},
					300
				)
				this.node.addClass("expanded")
			}else{
				this.pane.node.animate(
					{"height": "1px"},
					300,
					function(){
						this.node.removeClass("expanded")
					}.bind(this)
				)
				
			}
		}
	}
	
})
