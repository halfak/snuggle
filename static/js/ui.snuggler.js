ui = window.ui || {}

ui.Snuggler = Class.extend({
	init: function(model, view){
		this.model = model || new ui.Snuggler.Model()
		this.view  = view || new ui.Snuggler.View(this.model)
		this.node  = this.view.node
		
		this.view.menu.login.submitted.attach(this._handle_login_submit.bind(this))
		this.view.menu.logout.submitted.attach(this._handle_logout_submit.bind(this))
		$(window).focus(this._handle_window_focus.bind(this))
		
		this.model.changed.attach(this._handle_change.bind(this))
		
		this.changed = new Event(this)
		
		this._load_snuggler()
	},
	_handle_change: function(){
		this.changed.notify()
	},
	_handle_login_submit: function(_, creds){
		
		newwindow = window.open("/oauth/initiate/", "OAuth",'height=768,width=1024');
		if(window.focus){
			newwindow.focus()
		}
		
	},
	_handle_logout_submit: function(){
		this.view.menu.disabled(true)
		servers.local.snuggler.log_out(
			function(doc){
				this.model.clear()
				this.view.menu.disabled(false)
				this.view.menu.expanded(false)
			}.bind(this),
			function(message, doc){
				alert(message)
				this.view.menu.disabled(false)
			}.bind(this)
		)
	},
	_handle_window_focus: function(e){
		this.authenticated()
	},
	ping: function(){
		this.view.menu.expanded(true)
	},
	authenticated: function(){
		if(this.model.user){
			return true
		}else{
			if(this._load_snuggler()){
				return true
			}else{
				return false
			}
		}
	},
	_load_snuggler: function(){
		servers.local.snuggler.status(
			function(doc){
				if(doc.logged_in){
					this.model.load_doc(doc.snuggler)
					this.view.menu.expanded(false)
				}else{
					this.model.clear()
				}
			}.bind(this),
			function(message, doc, meta){
				alert(message)
			}.bind(this)
		)
	}
})

ui.Snuggler.Model = Class.extend({
		
	/** */
	init: function(){
		this.user = null
		this.changed = new Event(this)
	},
	
	/**
	Sets the credentials (usually after login).
		
	:Parameters:
		id : int
			Wikipedia user identifier
		name : string
			Wikipedia username
	*/
	load_doc: function(doc){
		logger.debug("Loading information for snuggler " + JSON.stringify(doc))
		this.user = {
			id: doc.id,
			name: doc.name
		}
		this.changed.notify(this.user)
	},
	
	/**
	Clears the credentials (usually after logging out.
	*/
	clear: function(){
		this.user = null
		this.changed.notify(this.user)
	}
})

ui.Snuggler.View = Class.extend({
	init: function(model){
		this.model = model
		
		this.node = $("<div>")
			.addClass("snuggler")
			.attr('id', "snuggler")
			
		this.preamble = {
			node: $("<span>")
				.addClass("preamble")
		}
		this.node.append(this.preamble.node)
		
		this.name = {
			node: $("<a>")
				.addClass("name")
		}
		this.node.append(this.name.node)
		
		this.menu = new ui.Snuggler.View.Menu()
		this.node.append(this.menu.node)
		
		this.model.changed.attach(this._render.bind(this))
	},
	reset: function(){
		this.menu.login.reset()
	},
	_ping: function(steps, duration, callback){
		if(steps > 0){
			this.node.addClass("pinging")
			setTimeout(function(){this.node.removeClass("pinging")}.bind(this), duration/2)
			setTimeout(function(){this._ping(steps-1, duration, callback)}.bind(this), duration)
		}else{
			callback()
		}
	},
	_render: function(){
		if(this.model.loading){
			this.preamble.node.text(i18n.get("Checking for previous session...") + " ")
			this.name.node.text("")
			this.name.node.attr("")
			this.menu.ready_login()
		}else if(this.model.user){
			this.preamble.node.text(i18n.get("Logged in as") + " ")
			this.name.node.text(this.model.user.name)
			this.name.node.attr('href', util.user_href(this.model.user.name))
			this.name.node.attr('target', "_blank")
			this.menu.ready_logout()
		}else{
			this.preamble.node.text(i18n.get("Not logged in...") + " ")
			this.name.node.text("")
			this.name.node.attr('href', "")
			this.menu.ready_login()
		}
	}
})

ui.Snuggler.View.Menu = ui.Dropper.extend({
	init: function(){
		this._super("", "", {class: "simple"})
		this.node.addClass("menu")
		
		this.login = new ui.Snuggler.View.Menu.Login()
		
		this.logout = new ui.Snuggler.View.Menu.Logout()
	},
	ready_login: function(){
		this.set_content(this.login.node)
	},
	ready_logout: function(){
		this.set_content(this.logout.node)
	},
	disabled: function(disabled){
		if(disabled === undefined){
			return this.node.hasClass("disabled")
		}else{
			if(disabled){
				this.node.addClass("disabled")
			}else{
				this.node.removeClass("disabled")
			}
			this.login.disabled(disabled)
			this.logout.disabled(disabled)
		}
	},
	expanded: function(expanded){
		return this._super(expanded)
	}
})

ui.Snuggler.View.Menu.Login = Class.extend({
	init: function(){
		this.node = $("<form>")
			.addClass("login")
			.submit(this._handle_submit.bind(this))
		
		this.preamble = {
			node: $("<p>")
			.addClass("preamble")
			.append(i18n.get("Log into your wiki account."))
		}
		this.node.append(this.preamble.node)
		
		this.login = new ui.Button(
			{
				label: i18n.get("log in"), 
				tooltip: i18n.get("click here to log in."),
				tabindex: env.tabindex.snuggler_form
			}
		)
		this.login.activated.attach(this._handle_login_activated.bind(this))
		this.node.append(this.login.node)
		
		this.submitted = new Event()
	},
	_handle_submit: function(e){
		if(!this.disabled()){
			this.submitted.notify()
		}
		util.kill_event(e)
	},
	_handle_login_activated: function(){
		if(!this.disabled()){
			this.submitted.notify()
		}
	},
	disabled: function(disabled){
		if(disabled === undefined){
			return this.login.disabled()
		}else{
			this.login.disabled(disabled)
		}
	}
})

ui.Snuggler.View.Menu.Logout = Class.extend({
	init: function(){
		this.node = $("<form>")
			.addClass("logout")
			.submit(this._handle_submit.bind(this))
		
		this.preamble = {
			node: $("<p>")
			.addClass("preamble")
			.append(i18n.get("Log out of Snuggle?"))
		}
		this.node.append(this.preamble.node)
		
		this.logout = new ui.Button(
			{
				label: i18n.get("log out"),
				tooltip: i18n.get("click here to log out"),
				tabindex: env.tabindex.snuggler_form
			}
		)
		this.logout.activated.attach(this._handle_logout_activated.bind(this))
		this.node.append(this.logout.node)
		
		this.submitted = new Event()
	},
	_handle_submit: function(){
		if(!this.disabled()){
			this.submitted.notify()
		}
		e.preventDefault()
	},
	_handle_logout_activated: function(){
		if(!this.disabled()){
			this.submitted.notify()
		}
	},
	disabled: function(disabled){
		if(disabled === undefined){
			return this.logout.disabled()
		}else{
			this.logout.disabled(disabled)
		}
	}
})
