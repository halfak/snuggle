ui = window.ui || {}

ui.UserActions = ui.Dropper.extend({
	init: function(actions){
		
		this.menu = new UI.FlyoutMenu()
		for(var i=0;i<actions.length;i++){
			this.menu.add(actions[i])
		}
		
		this._super("", this.menu.node)
		this.node.addClass("user_actions")
		this.node.addClass("simple")
		
		this.dropped.attach(this._dropped.bind(this))
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
ui.UserActions.from_config = function(config){
	var actions = []
	for(var i=0;i<config.user_actions.length;i++){
		doc = config.user_actions[i]
		actions.push(new ui.UserAction.from_doc(doc))
	}
	return new ui.UserActions(actions)
}

ui.UserAction = ui.FlyoutMenu.Action.extend({
	init: function(name, description, fields, watchable, opts){
		this._super(name, {tooltip: opts.tooltip})
		
		this.changed = new Event(this)
		
		this.description = {
			node: $("<p>")
				.append(util.linkify(description))
		}
		
		this.form = {
			'node': $("<form>")
				.submit(function(e){e.preventDefault();e.stopPropagation()})
		}
		
		this.watchable = true
		
		this._fields = {}
		for(var i=0;i<fields.length;i++){
			var field = fields[i]
			this._fields[field.name] = field
			this.form.node.append(field.node)
			field.changed.attach(function(){this.changed.notify()}.bind(this))
		}
	},
	disabled: function(disabled){
		for(var name in this._fields){
			var field = this._fields[name]
			field.disabled(disabled)
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
	reset: function(){
		for(var name in this._fields){
			var field = this._fields[name]
			field.reset()
		}
	}
})
ui.UserAction.from_doc = function(doc){
	var fields = []
	for(var i=0;i<doc.fields.length;i++){
		fields.push(ui.Field.from_doc(doc.fields[i]))
	}
	return new ui.UserAction(
		doc.name,
		doc.description,
		fields,
		doc.watchable,
		{
			tooltip: doc.tooltip
		}
	)
}
