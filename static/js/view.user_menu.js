View.UserMenu = UI.Dropper.extend({
	init: function(){
		
		this.menu = new UI.FlyoutMenu()
		this.menu.add(new View.UserMenu.Message())
		this.menu.add(new View.UserMenu.Invite())
		this.menu.add(new View.UserMenu.Report())
		
		this.menu.submitted.attach(this._submitted.bind(this))
		this.menu.changed.attach(this._changed.bind(this))
		this.menu.action_loaded.attach(this._action_loaded.bind(this))
		
		this._super("", this.menu.node)
		this.node.addClass("user_menu")
		this.node.addClass("simple")
		
		this.submitted = new Event(this)
		this.changed = new Event(this)
		this.action_loaded = new Event(this)
	},
	_submitted: function(_, action, watch){
		this.submitted.notify(action, watch)
	},
	_changed: function(_, action){
		this.changed.notify(action)
	},
	_action_loaded: function(_, action){
		this.action_loaded.notify(action)
	},
	_dropped: function(_, expanded){
		if(!expanded){this.menu.collapse()}
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
			this.menu.disabled(disabled)
		}
	}
})

View.UserMenu.Message = UI.FlyoutMenu.Action.extend({
	init: function(){
		this._super("send message", {title: "Posts a new topic on the user's talk page"})
		
		this.preamble = {
			node: $("<p>")
				.append(
					"Posts a free-form message  on the " + 
					"user's talk page."
				)
		}
		this.form.node.append(this.preamble.node)
		
		
		this.header = new UI.TextField({label: "Header:"})
		this.form.node.append(this.header.node)
		this.header.changed.attach(this._changed.bind(this))
		
		this.message = new UI.TextareaField({label: "Message:"})
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

View.UserMenu.Invite = UI.FlyoutMenu.Action.extend({
	init: function(){
		this._super("invite to teahouse",  {title: "Posts an invitation to WP:Teahouse on the user's talk page"})
		
		this.preamble = {
			node: $("<p>")
				.append("Posts an invitation to ")
				.append(wiki_link("WP:Teahouse"))
				.append(" on the user's talk page.")
		}
		this.form.node.append(this.preamble.node)
		
		this.header = new UI.TextField({label: "Header:"})
		this.form.node.append(this.header.node)
		this.header.changed.attach(this._changed.bind(this))
		
		this.template = new UI.RadioSet({label: "Template:"})
		this.template.append(new UI.Radio("Invitation"))
		this.template.append(new UI.Radio("Invitation2"))
		this.form.node.append(this.template.node)
		this.template.changed.attach(this._changed.bind(this))
		
		this.message = new UI.TextareaField({label: "Message:"})
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
			action: "invite",
			header: this.header.val(),
			template: this.template.val(),
			message: this.message.val()
		}
	}
})

View.UserMenu.Report = UI.FlyoutMenu.Action.extend({
	init: function(){
		this._super("report abuse", {title: "Posts a {{Vandal}} template for the user on WP:AIV"})
		
		this.preamble = {
			node: $("<p>")
				.append(
					"Reports vandals and spammers to admins. " + 
					"Use only for <b>obvious</b> and " + 
					"<b>persistent</b> cases. " + 
					"Please review "
				)
				.append(wiki_link("WP:Spam"))
				.append(", ")
				.append(wiki_link("WP:Vandaism"))
				.append(" and the ")
				.append(wiki_link("WP:AIV guide", "AIV Guide"))
		}
		this.form.node.append(this.preamble.node)
		
		
		this.reason = new UI.TextareaField({label: "Reason for listing: <small>Optional.  Keep it brief.</small>"})
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
	val: function(){
		return {
			action: "report",
			reason: this.reason.val()
		}
	}
})
