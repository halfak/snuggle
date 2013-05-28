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
		this.node.append(this.menu.node)
		
		this.model.changed.attach(this._render.bind(this))
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
			this.preamble.node.text(LANGUAGE.snuggler["Checking for previous session..."] + " ")
			this.name.node.text("")
			this.name.node.attr("")
			this.menu.ready_login()
		}else if(this.model.creds){
			this.preamble.node.text(LANGUAGE.snuggler["Logged in as"] + " ")
			this.name.node.text(this.model.user.name)
			this.name.node.attr('href', util.user_link(this.model.user.name))
			this.name.node.attr('target', "_blank")
			this.menu.ready_logout()
		}else{
			this.preamble.node.text(LANGUAGE.snuggler["Not logged in..."] + " ")
			this.name.node.text("")
			this.name.node.attr('href', "")
			this.menu.ready_login()
		}
	}
})

views.Snuggler.Menu = UI.Dropper.extend({
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
			.append(LANGUAGE.snuggler.login.description)
		}
		this.node.append(this.preamble.node)
		
		this.name = new ui.TextField(
			"name", 
			{
				label: LANGUAGE.snuggler.login.name.label, 
				tooltip: LANGUAGE.snuggler.login.name.tooltip, 
				tabindex: 1
			}
		)
		this.node.append(this.name.node)
		
		
		this.pass = new ui.TextField(
			"password", 
			{
				label: LANGUAGE.snuggler.login.pass.label, 
				tooltip: LANGUAGE.snuggler.login.name.tooltip,
				password: true,
				tabindex: 2
			}
		)
		this.node.append(this.pass.node)
		
		this.login = new ui.Button(
			'login',
			{
				label: LANGUAGE.snuggler.login.label, 
				label: LANGUAGE.snuggler.login.tooltip, 
				tabindex: 3
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
			.submit(self._handle_submit.bind(this))
		
		this.preamble = {
			node: $("<p>")
			.addClass("preamble")
			.append(LANGUAGE.snuggler.logout.description)
		}
		this.node.append(this.preamble.node)
		
		this.logout = new ui.Button(
			"logout",
			{
				label: LANGUAGE.snuggler.logout.label,
				tooltip: LANGUAGE.snuggle.logout.tooltip
			}
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
