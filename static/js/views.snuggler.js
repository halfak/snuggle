views = window.views || {}

/**
Represents a visual control for managing logged in status as a snuggler
*/
views.Snuggler = Class.extend({
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
		
		this.menu = new views.Snuggler.Menu()
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
	/**
	Produces a visual ping to draw the users attention to the element.
	*/
	ping: function(steps, opts){
		opts = opts || {}
		this._ping(
			steps || 3, 
			opts.duration || 500,
			opts.callback || function(){}
		)
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

views.Snuggler.Menu = ui.Dropper.extend({
	init: function(){
		this._super("", "", {class: "simple"})
		this.node.addClass("menu")
		
		this.login = new views.Snuggler.Menu.Login()
		
		this.logout = new views.Snuggler.Menu.Logout()
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

views.Snuggler.Menu.Login = Class.extend({
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
				tabindex: tabindex.snuggler_form
			}
		)
		this.node.append(this.name.node)
		
		
		this.pass = new ui.TextField(
			"password", 
			{
				label: i18n.get("Password"), 
				tooltip: i18n.get("your wiki password"),
				password: true,
				tabindex: tabindex.snuggler_form
			}
		)
		this.node.append(this.pass.node)
		
		this.login = new ui.Button(
			{
				label: i18n.get("log in"), 
				tooltip: i18n.get("click here to log in."),
				tabindex: tabindex.snuggler_form
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
		e.preventDefault()
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

views.Snuggler.Menu.Logout = Class.extend({
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
				tabindex: tabindex.snuggler_form
			}
		)
		this.logout.activated.attach(this._handle_logout_activated)
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
