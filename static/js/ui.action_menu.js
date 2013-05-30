ui = window.ui || {}

ui.ActionMenu = Class.extend({
	init: function(user, actions){
		this.user = user
		
		this.node = $("<div>")
			.addClass("action_menu")
			.keydown(this._handle_keydown.bind(this))
		
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
		this.cancelled  = new Event(this)
		this.submitted  = new Event(this)
		this.loaded     = new Event(this)
		this.keypressed = new Event(this)
		
		for(var i=0;i<actions.length;i++){
			this._add_action(actions[i])
		}
	},
	_handle_keydown: function(e){
		this.keypressed.notify(e)
	},
	_handle_submit: function(_, action, watch){
		this.submitted.notify(action, watch)
	},
	_handle_cancel: function(_){
		this.flyout.expanded(false)
		this.cancelled.notify()
	},
	_handle_action_changed: function(action, watch){
		this._delay_preview_load()
	},
	_handle_action_clicked: function(action){
		if(this.flyout.load(action)){
			this.loaded.notify(action, this.flyout.controls.watch.val())
			this._delay_preview_load()
		}
	},
	_handle_handle_clicked: function(action){
		if(!this.disabled()){
			if(this.flyout.load(action)){
				this.action_loaded.notify(action)
			}
		}
	},
	_delay_preview_load: function(){
		logger.debug("action_menu: delaying preview")
		if(this.preview_delay){
			clearTimeout(this.preview_delay)
		}
		this.preview_delay = setTimeout(
			this.load_preview.bind(this),  
			delays.action_preview
		)
	},
	load_preview: function(){
		if(this.flyout.action){
			logger.debug("action_menu: loading preview")
			this.flyout.previewer.loading(true)
			var action = this.flyout.action
			servers.local.users.preview_action(
				this.user,
				action,
				this.flyout.controls.watch.val(),
				function(op_docs){
					operations = op_docs.map(ui.ActionMenu.Operation.from_doc)
					
					this.flyout.load_preview(action, operations)
					this.flyout.previewer.loading(false)
				}.bind(this),
				function(message, doc, meta){
					operations = [new ui.ActionMenu.Error(doc)]
					
					this.flyout.load_preview(action, operations)
					this.flyout.previewer.loading(false)
				}.bind(this)
			)
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
ui.ActionMenu.PREVIEW_DELAY = 250


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
		
		this.panel = {
			node: $("<div>")
				.addClass("panel")
		}
		this.node.append(this.panel.node)
		
		this.previewer = new ui.ActionMenu.Flyout.Previewer()
		this.panel.node.append(this.previewer.node)
		
		this.controls = new ui.ActionMenu.Flyout.Controls()
		this.panel.node.append(this.controls.node)
		
		this.controls.cancelled.attach(this._handle_cancel.bind(this))
		
		//Handle width and height when the window resizes
		$(window).resize(this._set_max_width.bind(this))
	},
	_handle_cancel: function(){
		this.action.reset()
		this.controls.reset()
		this.unload()
	},
	_set_max_width: function(){
		var left = $(this.node).offset().left
		var right = $(window).innerWidth()
		
		this.panel.node.css("width", 2)
		var left = $(this.panel.node).offset().left
		var right = $(window).innerWidth()
		this.panel.node.css("width", (right-left)-20)
		
		this.panel.node.css("height", 2)
		this.panel.node.css("height", this.node.innerHeight())
	},
	expanded: function(expanded){
		if(expanded === undefined){
			return this.node.hasClass("expanded")
		}else{
			if(expanded){
				this.node.addClass("expanded")
				this._set_max_width()
			}else{
				this.node.removeClass("expanded")
				this._clear()
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
		if(action){
			if(action != this.action){
				this._clear()
				this.action = action
				this.form.node.append(this.action.form.node)
				this.action.selected(true)
				this.expanded(true)
				return true
			}else{
				this.expanded(true)
				return false
			}
			
		}else{
			this.unload()
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
			this.form.node.children().detach()
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
		
		this.watch = new ui.CheckField(
			"watch", 
			{
				class: "watch", 
				label: "watch user",
				tooltip: "Adds the this user's page and talk page to your watchlist",
				tabindex: tabindex.action_menu
			}
		)
		this.node.append(this.watch.node)
		
		this.cancel = new ui.Button({
			label: "cancel",
			tooltip: "Cancel this action.",
			class: "cancel",
			tabindex: tabindex.action_menu
		})
		this.cancel.activated.attach(this._cancel_activated.bind(this))
		this.node.append(this.cancel.node)
		
		this.submit = new ui.Button({
			label: "submit", 
			tooltip: "Complete this action.",
			class: "submit",
			tabindex: tabindex.action_menu
		})
		this.submit.activated.attach(this._submit_activated.bind(this))
		this.node.append(this.submit.node)
		
		this.submitted = new Event(this)
		this.cancelled = new Event(this)
		
		this.reset()
	},
	_cancel_activated: function(_){
		this.cancelled.notify()
	},
	_submit_activated: function(_){
		this.submitted.notify()
	},
	disabled: function(disabled){
		if(disabled === undefined){
			return this.node.hasClass("disabled")
		}else{
			this.watch.disabled(disabled)
			this.cancel.disabled(disabled)
			this.submit.disabled(disabled)
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
			.addClass("field-like")
		
		this.status = {
			node: $("<div>")
				.addClass("status")
				.text("preview")
		}
		this.node.append(this.status.node)
		
		this.operations = {
			node: $("<div>")
				.addClass("operations")
		}
		this.node.append(this.operations.node)
	},
	load: function(operations){
		this.clear()
		for(var i=0;i<operations.length;i++){
			var operation = operations[i]
			this.operations.node.append(operation.node)
		}
	},
	loading: function(loading){
		if(loading === undefined){
			return this.node.hasClass("loading")
		}else{
			if(loading){
				this.node.addClass("loading")
				this.status.node.text("loading...")
			}else{
				this.node.removeClass("loading")
				this.status.node.text("preview")
			}
		}
	},
	clear: function(){
		this.operations.node.html("")
	}
})

ui.ActionMenu.Operation = Class.extend({
	init: function(description){
		this.node = $("<div>")
			.addClass("operation")
		
		this.description = {
			node: $("<div>")
				.addClass("description")
				.append(description)
		}
		this.node.append(this.description.node)
	},
	load_doc: function(doc){
		throw "Not implemented... Must be subclasses"
	}
})
ui.ActionMenu.Operation.TYPES = {}
ui.ActionMenu.Operation.from_doc = function(doc){
	logger.debug("Constructing operation type=" + doc.type)
	Class = ui.ActionMenu.Operation.TYPES[doc.type] 
	if(Class){
		return Class.from_doc(doc)
	}else{
		throw "Configuration Error: Operation type " + doc.type + " not available."
	}
}

ui.ActionMenu.Error = ui.ActionMenu.Operation.extend({
	init: function(doc){
		if(doc.code){
			var message = doc.code + ": " + doc.message
		}else{
			var message = doc.message
		}
		this._super("[ERROR] " + message)
		this.node.addClass("error")
	}
})
ui.ActionMenu.Error.TYPE = "error"
ui.ActionMenu.Operation.TYPES[ui.ActionMenu.Error.TYPE] = ui.ActionMenu.Append
ui.ActionMenu.Error.from_doc = function(doc){
	return new ui.ActionMenu.Error(doc.code, doc.message)
}

ui.ActionMenu.Append = ui.ActionMenu.Operation.extend({
	init: function(page_name, html){
		this._super("Append to: " + util.htmlify(util.wiki_link(page_name)))
		this.node.addClass("append")
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
		this.node.addClass("replace")
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
		this.node.addClass("watch021")
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
				.addClass("clickable")
				.append($("<span>").append(name))
				.click(this._handle_click.bind(this))
				.attr("title", opts.tooltip || "")
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
ui.UserAction.from_doc = function(doc, formatting){
	var fields = []
	for(var i=0;i<doc.fields.length;i++){
		var field_doc = doc.fields[i]
		field_doc.tabindex = tabindex.action_menu
		fields.push(ui.Field.from_doc(doc.fields[i], formatting))
	}
	return new ui.UserAction(
		doc.name,
		util.linkify((doc.description || "").format(formatting)),
		fields,
		{
			tooltip: doc.tooltip,
			tabindex: tabindex.action_menu
		}
	)
}



