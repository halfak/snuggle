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
menu.append(new UI.FlyoutMenu.Message())
menu.append(new UI.FlyoutMenu.Invite())
menu.append(new UI.FlyoutMenu.Report())
*/


/*

Responsibilities:
 - Connect handle clicks to form loads in a PostFlyout
*/
UI.FlyoutMenu = Class.extend({
	init: function(){
		this.node = $("<div>")
			.addClass("flyout_menu")
		
		this.actions = {
			node: $("<div>")
				.addClass("actions"),
			list: []
		}
		this.node.append(this.actions.node)
		
		this.flyout = new UI.FlyoutMenu.PostFlyout()
		this.node.append(this.flyout.node)
	},
	add: function(action){
		this.handles.append(action.node)
		action.handle.clicked.attach(function(){this._handle_clicked(action)}.bind(this))
		this.handles.list.push(from.handle)
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
			this.flyout.disabled(disabled)
			this.actions.list.map(function(action){action.disabled(disabled)})
		}
	},
	_handle_clicked: function(action){
		if(!this.disabled()){
			this.flyout.load(action)
		}
	},
	collapse: function(){
		this.flyout.unload()
	}
	
	
})

/*
Responsibilities
 - Load general form content.
 - 
*/
UI.FlyoutMenu.PostFlyout = Class.extend({
	init: function(){
		this.node = $("<div>")
			.addClass("flyout")
		
		this.action = null
		
		this.preview = new UI.WikiPreview()
		this.node.append(this.preview.node)
		
		this.controls = new UI.FlyoutMenu.PostFlyout.Controls()
		this.node.append(this.controls.node)
		
		this.controls.cancel.clicked.attach(this._cancelled.bind(this))
		this.controls.post.clicked.attach(this._submitted.bind(this))
		
		this.submitted = new Event(this)
	},
	_cancelled: function(){
		this.action.reset()
		this.controls.reset()
		this.unload()
	},
	_submitted: function(){
		this.submitted.notify(this.val())
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
			if(this.action){
				this.action.form.disabled(disabled)
			}
			this.controls.disabled(disabled)
		}
	},
	load: function(action){
		if(action != this.action){
			if(action){
				this._clear()
				this.action = action
				this.node.prepend(action.form.node)
				this.action.selected(true)
				this.expanded(true) //make sure we expanded. 
			}else{
				this.unload()
			}
		}
	},
	unload: function(){
		this.expanded(false)
		this._clear()
	},
	val: function(){
		if(this.action){
			return {
				action: this.action.val(),
				watch: this.controls.watch.val()
			}
		}else{
			throw "No action selected."
		}
	},
	_clear: function(){
		if(this.action){
			this.action.form.node.detach()
			this.action.selected(false)
			this.action = null
		}
		this.preview.clear()
	}
})

UI.FlyoutMenu.PostFlyout.Controls = Class.extend({
	init: function(){
		this.node = $("<div>")
			.addClass("controls")
		
		this.watch = new UI.CheckField({label: "add user to watchlist"})
		this.node.append(this.watch.node)
		
		this.cancel = new UI.Button({label: "cancel", title: "Click here to cancel the action."})
		this.node.append(this.cancel.node)
		
		this.post = new UI.Button({label: "post", title: "Click here to to complete the action."})
		this.node.append(this.post.node)
		
		this.reset()
	},
	disabled: function(disabled){
		if(disabled === undefined){
			return this.node.hasClass("disabled")
		}else{
			this.watch.disabled(disabled)
			this.cancel.disabled(disabled)
			this.post.disabled(disabled)
		}
	},
	reset: function(){
		this.watch.checked(false)
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

UI.FlyoutMenu.Action = Class.extend({
	init: function(display, action){
		this.node = $("<div>")
			.addClass("handle")
			.append($("<span>").append(display))
			.click(this._clicked.bind(this))
		
		this.form = { //Defined by subclass
			node: $("<div>")
				.addClass("form")
		}
		
		this.clicked = new Event(action)
		this.changed = new Event(action)
	},
	_clicked: function(e){
		if(!this.disabled()){
			this.clicked.notify()
		}
	},
	_changed: function(){
		this.changed.notify()
	}
	selected: function(selected){
		if(selected === undefined){
			return this.node.hasClass("selected")
		}else{
			if(selected){
				this.node.addClass("selected")
			}else{
				this.node.removeClass("selected")
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
			this.form.disabled(disabled)
		}
	},
	val: function(val){
		throw "This function must be implemented by a subclass"
	},
	reset: function(){
		this.selected(false)
	}
})

View.UserMenu.Message = UI.FlyoutMenu.Action.extend({
	init: function(){
		this._super("send message", this)
		
		this.header = UI.TextField({label: "Header:"})
		this.form.node.append(this.header.node)
		this.header.changed.attach(this._changed.bind(this))
		
		this.message = UI.TextareaField({label: "Message:"})
		this.form.node.append(this.message.node)
		this.message.changed.attach(this._changed.bind(this))
		
		this.reset()
	},
	disabled: function(disabled){
		this._super(disabled)
		this.header.disabled(disabled)
		this.message.disabled(disabled)
	},
	reset: function(){
		this._super()
		this.header.val("")
		this.message.val("")
	},
	val: function(){
		return {
			action: "send message",
			header: this.header.val(),
			message: this.message.val()
		}
	}
})

UI.UserMenu.Invite = UI.PostWidget.extend({
	init: function(){
		this._super("invite to teahouse", this)
		
		this.header = UI.TextField({label: "Header:"})
		this.form.node.append(this.header.node)
		this.header.changed.attach(this._changed.bind(this))
		
		this.template = new UI.Radios({label: "Template:"})
		this.template.add(new UI.Radio({value: "Invitation"}))
		this.template.add(new UI.Radio({value: "Invitation2"}))
		this.form.node.append(this.template.node)
		this.template.changed.attach(this._changed.bind(this))
		
		this.message = UI.TextareaField({label: "Message:"})
		this.form.node.append(this.message.node)
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
		this._super()
		this.header.val("")
		this.template.val("Invitation")
		this.message.val("")
	},
	val: function(){
		return {
			action: "invite to teahouse",
			header: this.header.val(),
			template: this.template.val(),
			message: this.message.val()
		}
	}
})

UI.UserMenu.Report = UI.PostWidget.extend({
	init: function(){
		this._super("report abuse", this)
		
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
		this.form.node.append(this.preamble.node)
		
		
		this.reason = UI.TextareaField({label: "Reason for listing: <small>Optional.  Keep it brief.</small>"})
		this.form.node.append(this.reason.node)
		this.reason.changed.attach(this._changed.bind(this))
		
		this.reset()
	},
	disabled: function(disabled){
		this._super(disabled)
		this.reason.disabled(disabled)
	},
	reset: function(){
		this._super()
		this.reason.val("")
	},
	format: function(){
		return {
			action: "report abuse",
			reason: this.reason.val()
		}
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
