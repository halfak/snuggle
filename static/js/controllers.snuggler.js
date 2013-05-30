controllers = window.controllers || {}

controllers.Snuggler = Class.extend({
		
	init: function(){
		this.model = new models.Snuggler()
		this.view  = new views.Snuggler(this.model)
		this.node  = this.view.node
		
		this.view.login_submitted.attach(this._handle_login_submit.bind(this))
		this.view.logout_submitted.attach(this._handle_logout_submit.bind(this))
		
		this._load_snuggler()
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
		this.local.snuggler.log_out(
			function(doc){
				this.model.clear()
				this.menu.disabled(false)
				this.menu.expanded(false)
			}.bind(this),
			function(message, doc){
				alert(message)
				this.menu.disabled(false)
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
				console.log(doc)
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
	
	
