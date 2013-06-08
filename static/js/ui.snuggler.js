ui = window.ui || {}

ui.Snuggler = Class.extend({
	init: function(model, view){
		this.model = model || new ui.Snuggler.Model()
		this.view  = view || new ui.Snuggler.View(this.model)
		this.node  = this.view.node
		
		this.view.login_submitted.attach(this._handle_login_submit.bind(this))
		this.view.logout_submitted.attach(this._handle_logout_submit.bind(this))
		
		this.model.changed.attach(this._handle_change.bind(this))
		
		this.changed = new Event(this)
		
		this._load_snuggler()
	},
	_handle_change: function(){
		this.changed.notify()
	},
	_handle_login_submit: function(_, creds){
		if(creds.name.length > 0){
			this.view.menu.disabled(true)
			servers.local.snuggler.authenticate(
				creds.name,
				creds.pass,
				function(doc){
					this.model.load_doc(doc)
					this.view.menu.disabled(false)
					this.view.menu.expanded(false)
					this.view.reset()
				}.bind(this),
				function(message, doc, meta){
					if(doc && doc.code && doc.code == "authentication"){
						if(meta.type == "password"){
							alert("Could not log in.  Password incorrect.")
						}else if(meta.type == "username"){
							alert("Could not log in.  No user by the name '" + creds.name + "'.")
						}else if(meta.type == "connection"){
							alert("Could not log in.  Connection to " + MEDIAWIKI.domain + " failed.")
						}else{
							alert(message)
						}
					}else{
						alert(message)
					}
					this.view.menu.disabled(false)
				}.bind(this)
			)
		}else{
			alert("You must specify a username in order to log in.")
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
	ping: function(){
		this.view.menu.expanded(true)
	},
	authenticated: function(){
		if(this.model.user){
			if(!this._last_check || util.now() - this._last_check > delays.check_snuggler_auth){
				this._load_snuggler()
			}
			return true
		}else{
			return false
		}
	},
	_load_snuggler: function(){
		servers.local.snuggler.status(
			function(doc){
				if(doc.logged_in){
					this.model.load_doc(doc.snuggler)
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
		this.menu.login.submitted.attach(this._handle_login_submit.bind(this))
		this.menu.logout.submitted.attach(this._handle_logout_submit.bind(this))
		this.node.append(this.menu.node)
		
		this.login_submitted = new Event()
		this.logout_submitted = new Event()
		
		this.model.changed.attach(this._render.bind(this))
	},
	_handle_login_submit: function(_){
		this.login_submitted.notify({
			name: this.menu.login.name.val(),
			pass: this.menu.login.pass.val()
		})
	},
	_handle_logout_submit: function(_){
		this.logout_submitted.notify()
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
			this.name.node.attr('href', util.user_link(this.model.user.name))
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
		ret = this._super(expanded)
		if(expanded){
			this.login.name.focus()
		}
		return ret
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
		
		this.name = new ui.TextField(
			"name", 
			{
				label: i18n.get("Username"), 
				tooltip: i18n.get("your wiki username"),
				tabindex: env.tabindex.snuggler_form
			}
		)
		this.name.keypressed.attach(this._handle_keypress.bind(this))
		this.node.append(this.name.node)
		
		
		this.pass = new ui.TextField(
			"password", 
			{
				label: i18n.get("Password"), 
				tooltip: i18n.get("your wiki password"),
				password: true,
				tabindex: env.tabindex.snuggler_form
			}
		)
		this.pass.keypressed.attach(this._handle_keypress.bind(this))
		this.node.append(this.pass.node)
		
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
	_handle_submit: function(){
		if(!this.disabled()){
			this.submitted.notify()
		}
		util.kill_event(e)
	},
	_handle_keypress: function(_, e){
		if(!this.disabled()){
			if(e.which == keys.ENTER){
				this.submitted.notify()
				util.kill_event(e)
			}
		}
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
			this.name.disabled(disabled)
			this.pass.disabled(disabled)
			this.login.disabled(disabled)
		}
	},
	reset: function(){
		this.name.val('')
		this.pass.val('')
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
