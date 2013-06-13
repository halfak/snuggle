ui.Snuggle = Class.extend({
	init: function(){
		this.node = $("body")
		
		logger.info("ui.snuggle: loading...")
		
		this.status = new ui.SystemStatus()
		this.status.element.clicked.attach(this._handle_status_element_clicked.bind(this))
		this.status.visible(false)
		this.node.append(this.status.node)
		
		this.welcome = new ui.Welcome()
		this.welcome.start.attach(this._handle_welcome_start.bind(this))
		this.node.append(this.welcome.node)
		
		// Set up help
		this.help = new ui.Help(configuration.i18n.lang)
		this.node.append(this.help.node)
		
		// Set up snuggler
		this.snuggler = new ui.Snuggler()
		this.node.append(this.snuggler.node)
		
		// Set up user browser
		this.user_browser = new ui.UserBrowser()
		this.user_browser.visible(false)
		this.node.append(this.user_browser.node)
	},
	_handle_welcome_start: function(){
		this._toggle_welcome()
	},
	_handle_status_element_clicked: function(){
		this._toggle_welcome()
	},
	_toggle_welcome: function(){
		logger.debug("ui.snuggle: toggling welcome")
		this.welcome.visible(!this.welcome.visible())
		
		if(this.welcome.visible()){
			this.status.visible(false)
		}else{
			this.status.visible(true)
			this.user_browser.load()
			this.user_browser.visible(true)
		}
	}
})


