/*
var menu = new UI.UserMenu(
	"actions",
	[
		{tab: "message", pane: UI.Message()},
		{tab: "welcome", pane: UI.Welcome()},
		{tab: "invite", pane: UI.Invite()},
		{tab: "report", pane: UI.Report()}
	]
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
*/

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

UI.FlyoutMenu = Class.extend({
	init: function(){
		this.node = $("<div>")
			.addClass("flyout_menu")
		
		this.items = {
			node: $("<div>")
				.addClass("items")
		}
		this.node.append(this.actions.node)
		
		this.flyout = new UI.UserMenu.Flyout()
		
	}		
})

UI.FlyoutMenu.Item = Class.extend({
	init: function(display, content){
		this.handle = {
			node: $("<div>")
				.addClass("handle")
				.append(display)
		}
		
		this.content = content
	}
})

UI.FlyoutMenu.PostFlyout = Class.extend({
	init: function(){
		this.node = $("<div>")
			.addClass("flyout")
		
		this.form_pane = {
			node: $("<div>")
				.addClass("form_pane")
		}
		this.node.append(this.form_pane.node)
		
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
	load: function(form){
		this.form_pane.node.chilren().detach()
		
		this.form_pane.node.append(content_node)
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
