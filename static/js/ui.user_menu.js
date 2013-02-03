/*
var menu = new UI.UserMenu("actions",
	[...]
)
menu.post.attach(function(menu, action){
	server.user_action(
		action.type,
		action.val(),
		function(){
			
		},
		function(code, message){
			
		}
	)
})

var menu = new UI.FlyoutMenu()
menu.append(new UI.FlyoutMenu.MessageForm())
menu.append(new UI.FlyoutMenu.InviteForm())
menu.append(new UI.FlyoutMenu.ReportForm())
*/


/*

Responsibilities:
 - Connect handle clicks to form loads in a PostFlyout
*/
UI.FlyoutMenu = Class.extend({
	init: function(){
		this.node = $("<div>")
			.addClass("flyout_menu")
		
		this.items = {
			node: $("<div>")
				.addClass("items")
		}
		this.node.append(this.actions.node)
		
		this.flyout = new UI.FlyoutMenu.PostFlyout()
	},
	append: function(form){
		this.items.append(form.handle.node)
		form.handle.node.click(function(e){this._handle_clicked(form)}.bind(this))
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
			this.flyout.disabled()
		}
	},
	_handle_clicked: function(form){
		if(!this.disabled()){
			this.flyout.load(form)
		}
	},
	collapse: function(){
		this.flyout.unload()
	}
	
	
})

/*
Responsibilities
 - Load general form content. 
 - Keep form appraised of its status
 - 
*/
UI.FlyoutMenu.PostFlyout = Class.extend({
	init: function(){
		this.node = $("<div>")
			.addClass("flyout")
		
		this.form = null
		
		this.preview = new UI.WikiPreview()
		this.node.append(this.preview.node)
		
		this.controls = new UI.FlyoutMenu.PostFlyout.Controls()
		this.node.append(this.controls.node)
	},
	expanded: function(expanded){
		if(expanded === undefined){
			return this.node.hasClass("expanded")
		}else{
			if(expanded){
				this.node.addClass("expanded")
			}else{
				this.node.removeClass("expanded")
			}
		}
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
			if(this.form){
				this.form.disabled(disabled)	
			}
		}
	},
	load: function(form){
		if(form && form != this.form){
			this._clear()
			form.attach(this)
			this.form = form
			this.expanded(true)
		}
	},
	unload: function(){
		this._clear()
		this.expanded(false)
	},
	_clear: function(){
		if(this.form){
			this.form.detach()
			this.form = null
		}
	}
})

UI.FlyoutMenu.Form = Class.extend({
	init: function(display, content){
		this.handle = {
			node: $("<div>")
				.addClass("handle")
				.append(display)
		}
		
		this.content = content
	}
})



UI.WikiPreview = Class.extend({
	init: function(){
		this.node = $("<div>")
			.addClass("wiki_preview")	
	},
	load: function(html){
		this.node.html(html)
	},
	clear: function(){
		this.node.html()
	}
})

UI.DropperMenu = UI.Dropper.extend({
	init: function(user, tab, actions){
		this._super(tab)
		this.user = user
		
		this.actions = {
			node: $("<div>")
				.addClass("actions"),
			list: []
		}
		
		for(var i in actions){
			var action = actions[i]
			this.actions.node.append(action.node)
			this.actions.push(action)
			action.dropped.attach(this._dropped_action.bind(this))
			action.submitted.attach(this._submitted_action.bind(this)) //Doesn't exist yet
		}
		
		this.submitted = new Event(this)
		
		this.dropped.attach(this._dropped.bind(this))
	},
	_dropped_action: function(action, expanded){
		//If any of the actions are interacted with, we want to retract
		//all of the other potential actions.
		this.reset(action)
	},
	_submitted_action: function(action){
		this.submitted.notify(action)
	},
	_dropped: function(_, expanded){
		if(!expanded){this.reset()}
	},
	reset: function(except){
		//Retract all of the actions -- except the specified action
		for(var i in this.actions.list){
			var action = this.actions.list[i]
			if(action != except){
				actions.expanded(false)
			}
		}
	},
	disabled: function(disabled){
		if(disabled === undefined){
			return this.node.hasClass("disabled")
		}else{
			if(disabled){
				this.node.addClass("disabled")
			}else{
				this.node.removedClass("disabled")
			}
			this.actions.list.map(function(a){a.disabled(disabled)})//Not sure if this will work
		}
	}
})


UI.PostWidget = UI.Dropper.extend({
	init: function(tab, opts){
		this._super(tab)
		opts = opts || {}
		
		this.node.addClass("post_widget")
		
		this.fields = {
			node: $("<div>")
				.addClass("fields")
		}
		this.pane.append(this.fields.node)
		
		this.preview   = new UI.PostPreview()
		this.pane.append(this.preview.node)
		
		this.controls  = new UI.PostWidget.Controls({watchable: opts.watchable})
		this.controls.submitted.attach(this._submitted.bind(this))
		this.controls.cancelled.attach(this._cancelled.bind(this))
		this.pane.append(this.controls)
		
		this.submitted = new Event(this)
		this.cancelled = new Event(this)
		this.changed   = new Event(this)
	},
	_changed: function(){this.changed.notify()},
	_submitted: function(){
		this.submitted.notify()
	},
	_cancelled: function(){
		this.cancelled.notify()
	},
	disabled: function(disabled){
		this.controls.disabled(disabled)
	}
	reset: function(){
		throw "Not Implemented"
	},
	format: function(){
		throw "Not Implemented"
	}
})

UI.UserMenu.Message = UI.PostWidget.extend({
	init: function(){
		this._super("send message", {watchable: true})
		
		this.header = UI.TextField({label: "Header:"})
		this.fields.node.append(this.header.node)
		this.header.changed.attach(this._changed.bind(this))
		
		this.message = UI.TextareaField({label: "Message:"})
		this.fields.node.append(this.message.node)
		this.message.changed.attach(this._changed.bind(this))
		
		this.reset()
	},
	disabled: function(disabled){
		this._super(disabled)
		this.header.disabled(disabled)
		this.message.disabled(disabled)
	},
	reset: function(){
		this.header.val("")
		this.message.val("")
		this.controls.watch.selected(false)
	},
	format: function(){
		return "== " + this.header.val() + " ==\n" + 
		       this.message.val() + "~~" + " ~~"
	}
})

UI.UserMenu.Invite = UI.PostWidget.extend({
	init: function(){
		this._super("invite to teahouse", {watchable: true})
		
		this.header = UI.TextField({label: "Header:"})
		this.fields.node.append(this.header.node)
		this.header.changed.attach(this._changed.bind(this))
		
		this.template = new UI.Radios({label: "Template:"})
		this.template.add(new UI.Radio({value: "Invitation"}))
		this.template.add(new UI.Radio({value: "Invitation2"}))
		this.fields.node.append(this.template.node)
		
		this.message = UI.TextareaField({label: "Message:"})
		this.fields.node.append(this.message.node)
		this.message.changed.attach(this._changed.bind(this))
		
		this.reset()
	},
	disabled: function(disabled){
		this._super(disabled)
		this.header.disabled(disabled)
		this.template.disabled(disabled)
		this.message.disabled(disabled)
	},
	reset: function(){
		this.header.val("")
		this.message.val("")
		this.controls.watch.selected(false)
	},
	format: function(){
		return "==" + this.header.val() + "==\n" +
		       "{{subst:" + 
		       this.template.val() + 
		       "|sign=~~" + "~~" + 
		       "|message=" + this.message.val().replace("|", "{{!}}") + 
		       "}}"
	}
})

UI.UserMenu.Report = UI.PostWidget.extend({
	init: function(){
		this._super("report abuse", {watchable: true})
		
		this.preamble = {
			node: $("<p>")
				.append(
					"Reports obvious and persistent cases " + 
					"of vandals and spammers to admins. " + 
					"Please review "
				)
				.append(wiki_link("WP:Spam"))
				.append(", ")
				.append(wiki_link("WP:Vandaism"))
				.append(" and the ")
				.append(wiki_link("WP:AIV guide", "AIV Guide")
		}
		
		this.reason = UI.TextareaField({label: "Reason for listing: <small>Optional.  Keep it brief."})
		this.fields.node.append(this.reason.node)
		this.reason.changed.attach(this._changed.bind(this))
		
		this.reset()
	},
	disabled: function(disabled){
		this._super(disabled)
		this.reason.disabled(disabled)
	},
	reset: function(){
		this.reason.val("")
		this.controls.watch.selected(false)
	},
	format: function(){
		return "* {{Vandal|" + "/* ToDo username */" + "}}" + 
			this.reason.val()
	}
})
