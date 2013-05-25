ui = window.ui || {}

ui.ActionMenu = Class.extend({
	init: function(actions){
		this.node = $("<div>")
			.addClass("action_menu")
		
		this.handles = {
			node: $("<div>")
				.addClass("handles"),
			list: []
		}
		this.node.append(this.handles.node)
		
		this.flyout = new ui.ActionMenu.Flyout()
		this.flyout.controls.submitted.attach(this._handle_submit.bind(this))
		this.flyout.controls.cancelled.attach(this._handle_cancel.bind(this))
		this.node.append(this.flyout.node)
		
		// Events
		this.cancelled        = new Event(this)
		this.action_submitted = new Event(this)
		this.action_changed   = new Event(this)
		this.action_loaded    = new Event(this)
		
		for(var i=0;i<actions.length;i++){
			this._add_action(actions[i])
		}
	},
	_handle_submit: function(_, action, watch){
		this.action_submitted.notify(action, watch)
	},
	_handle_cancel: function(_){
		this.flyout.expanded(false)
		this.cancelled.notify()
	},
	_handle_action_changed: function(action, watch){
		this.action_changed.notify(action, watch)
	},
	_handle_action_clicked: function(action){
		this.flyout.load(action)
	},
	_handle_handle_clicked: function(action){
		if(!this.disabled()){
			if(this.flyout.load(action)){
				this.action_loaded.notify(action)
			}
		}
	},
	_add_action: function(action){
		this.handles.node.append(action.handle.node)
		this.handles.list.push(action)
		action.clicked.attach(this._handle_action_clicked.bind(this))
		action.changed.attach(this._handle_action_changed.bind(this))
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
	expanded: function(expanded){
		return this.flyout.expanded(expanded)
	}
})

/*
Responsibilities
 - Load general form content.
 - Show a preview.
*/
ui.ActionMenu.Flyout = Class.extend({
	init: function(){
		this.node = $("<div>")
			.addClass("flyout")
		
		this.action = null
		
		this.form = {
			node: $("<div>")
				.addClass("form")
		}
		this.node.append(this.form.node)
		
		this.previewer = new ui.ActionMenu.Flyout.Previewer()
		this.node.append(this.previewer.node)
		
		this.controls = new ui.ActionMenu.Flyout.Controls()
		this.node.append(this.controls.node)
		
		this.controls.cancelled.attach(this._handle_cancel.bind(this))
	},
	_handle_cancel: function(){
		this.action.reset()
		this.controls.reset()
		this.unload()
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
				this.action.disabled(disabled)
			}
			this.controls.disabled(disabled)
		}
	},
	load: function(action){
		if(action != this.action){
			if(action){
				this._clear()
				this.action = action
				this.form.node.append(this.action.form.node)
				this.action.selected(true)
				this.expanded(true) //make sure we expanded
				return true
			}else{
				this.unload()
			}
		}
	},
	load_preview: function(action, operations){
		if(action == this.action){
			this.previewer.load(operations)
		}
	},
	unload: function(){
		this.expanded(false)
		this._clear()
	},
	_clear: function(){
		if(this.action){
			this.action.form.node.children().detach()
			this.action.selected(false)
			this.action = null
		}
		this.previewer.clear()
	}
})

ui.ActionMenu.Flyout.Controls = Class.extend({
	init: function(){
		this.node = $("<div>")
			.addClass("controls")
		
		this.watch = new ui.CheckField("watch", {label: "add user to watchlist"})
		this.node.append(this.watch.node)
		
		this.cancel = new ui.Button({label: "cancel", title: "Click here to cancel the action."})
		this.node.append(this.cancel.node)
		
		this.post = new ui.Button({label: "submit", title: "Click here to to complete the action."})
		this.node.append(this.post.node)
		
		this.submitted = new Event(this)
		this.cancelled = new Event(this)
		
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
		this.watch.val(false)
	}
})

ui.ActionMenu.Flyout.Previewer = Class.extend({
	init: function(){
		this.node = $("<div>")
			.addClass("previewer")
	},
	load: function(operations){
		this.clear()
		for(var i=0;i<operations.length;i++){
			var operation = operations[i]
			this.node.append(operation.node)
		}
	},
	loading: function(loading){
		if(loading === undefined){
			return this.node.hasClass("loading")
		}else{
			if(loading){
				this.node.addClass("loading")
			}else{
				this.node.removeClass("loading")
			}
		}
	},
	clear: function(){
		this.node.html("")
	}
})

ui.ActionMenu.Operation = Class.extend({
	init: function(description){
		this.node = $("<div>")
			.addClass("operation")
		
		this.description = {
			node: $("<div>")
				.addClass("description")
		}
		this.node.append(description)
	},
	load_doc: function(doc){
		throw "Not implemented... Must be subclasses"
	}
})
ui.ActionMenu.Operation.TYPES = {}
ui.ActionMenu.Operation.from_doc = function(doc){
	Class = this.TYPES[doc.type] 
	if(Class){
		return Class.from_doc(doc)
	}else{
		throw "Configuration Error: Operation type " + doc.type + " not available."
	}
}

ui.ActionMenu.Append = ui.ActionMenu.Operation.extend({
	init: function(page_name, html){
		this._super("Append to " + util.htmlify(util.wiki_link(page_name)))
		this.html = new ui.HTMLPreview(html)
		this.node.append(this.html.node)
	}
})
ui.ActionMenu.Append.TYPE = "append"
ui.ActionMenu.Operation.TYPES[ui.ActionMenu.Append.TYPE] = ui.ActionMenu.Append
ui.ActionMenu.Append.from_doc = function(doc){
	return new ui.ActionMenu.Append(doc.page_name, doc.html)
}

ui.ActionMenu.Replace = ui.ActionMenu.Operation.extend({
	init: function(page_name, html){
		this._super("Replace " + util.htmlify(util.wiki_link(page_name)) + " with:")
		this.html = new ui.HTMLPreview(html)
		this.node.append(this.html.node)
	}
})
ui.ActionMenu.Replace.TYPE = "replace"
ui.ActionMenu.Operation.TYPES[ui.ActionMenu.Replace.TYPE] = ui.ActionMenu.Replace
ui.ActionMenu.Replace.from_doc = function(doc){
	return new ui.ActionMenu.Replace(doc.page_name, doc.html)
}

ui.ActionMenu.Watch = ui.ActionMenu.Operation.extend({
	init: function(page_name){
		this._super("Add " + util.htmlify(util.wiki_link(page_name)) + " to my watchlist.")
	}
})
ui.ActionMenu.Watch.TYPE = "watch"
ui.ActionMenu.Operation.TYPES[ui.ActionMenu.Watch.TYPE] = ui.ActionMenu.Watch
ui.ActionMenu.Watch.from_doc = function(doc){
	return new ui.ActionMenu.Watch(doc.page_name)
}

ui.HTMLPreview = Class.extend({
	init: function(html){
		this.node = $("<div>")
			.addClass("wiki_format")
			.append(html)
	}
})

ui.UserAction = Class.extend({
	init: function(name, description, fields, opts){
		opts = opts || {}
		
		this.name = name
		
		this.handle = {
			node: $("<div>")
				.addClass("handle")
				.append($("<span>").append(name))
				.click(this._handle_click.bind(this))
		}
		if(opts.tooltip){
			this.handle.node.attr("title", opts.tooltip)
		}
		
		this.form = {
			'node': $("<form>")
				.submit(function(e){e.preventDefault();e.stopPropagation()})
		}
		
		var description = {
			node: $("<p>")
				.append(util.linkify(description))
		}
		this.form.node.append(description.node)
		
		this._fields = {}
		for(var i=0;i<fields.length;i++){
			var field = fields[i]
			this._fields[field.name] = field
			this.form.node.append(field.node)
			field.changed.attach(this._handle_change.bind(this))
		}
		
		this.changed = new Event(this)
		this.clicked = new Event(this)
	},
	_handle_click: function(e){
		if(!this.disabled()){
			this.clicked.notify()
		}
	},
	_handle_change: function(field){
		this.changed.notify()
	},
	selected: function(selected){
		if(selected === undefined){
			return this.handle.node.hasClass("selected")
		}else{
			if(selected){
				this.handle.node.addClass("selected")
			}else{
				this.handle.node.removeClass("selected")
			}
		}
	},
	disabled: function(disabled){
		if(disabled === undefined){
			return this.handle.node.hasClass("disabled")
		}else{
			if(disabled){
				this.handle.node.addClass("disabled")
			}else{
				this.handle.node.removeClass("disabled")
			}
			for(var name in this._fields){
				var field = this._fields[name]
				field.disabled(disabled)
			}
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



