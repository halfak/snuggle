ui = window.ui || {}

ui.UserMenu = ui.Dropper.extend({
	init: function(actions){
		
		this.menu = new ui.FlyoutMenu()
		for(var i=0;i<actions.length;i++){
			
		}
	}
})

ui.UserAction = ui.FlyoutMenu.Action.extend({
	init: function(name, description, fields, watchable, opts){
		this._super(name, {tooltip: opts.tooltip})
		
		this.changed = new Event(this)
		
		this.description = {
			node: $("<p>")
				.append(description)
		}
		
		this.form = {
			'node': $("<form>")
				.submit(function(e){e.preventDefault();e.stopPropagation()})
		}
		
		this._fields = {}
		for(var i=0;i<fields.length;i++){
			var field = fields[i]
			this._fields[field.name] = field
			this.form.node.append(field.node)
			field.changed.attach(function(){this.changed.notify()}.bind(this))
		}
	},
	fields: function(){
		field_map = {}
		for(var name in this._fields){
			var field = this._fields[name]
			field_map[name] = field.val()
		}
		return field_map
	},
	
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
