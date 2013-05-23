View = window.View || {}

View.UserMenu = UI.Dropper.extend({
	init: function(actions){
		
		this.menu = new UI.FlyoutMenu()
		for(var i=0;i<actions.length;i++){
			
		}
	}
})

View.UserAction = UI.FlyoutMenu.Action.extend({
	init: function(name, description, fields, watchable, opts){
		this._super("send message", {title: opts.title})
		
		this.description = {
			node: $("<p>")
				.append(description)
		}
	}
})

View.UserAction.Field = Class.extend({
	init: function(name, label){
		
	}
})


View.UserMenu.Message = UI.FlyoutMenu.Action.extend({
	init: function(){
		this._super("send message", {title: "Posts a new topic on the user's talk page"})
		
		this.preamble = {
			node: $("<p>")
				.append(
					"Posts a free-form message on the " + 
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
			type: "send message",
			header: this.header.val(),
			message: this.message.val()
		}
	}
})
