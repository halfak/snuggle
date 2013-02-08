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
		
		this.submitted     = new Event(this)
		this.changed       = new Event(this)
		this.action_loaded = new Event(this)
	},
	_submitted: function(_ action){
		this.submitted.notify(action)
	},
	_action_clicked: function(action){
		if(!this.disabled()){
			if(this.flyout.load(action)){
				this.action_loaded.notify(action)
			}
		}
	},
	_action_changed: function(action){
		this.changed.notify(action)
	},
	add: function(action){
		this.actions.append(action.node)
		action.clicked.attach(this._action_clicked.bind(this))
		action.changed.attach(this._action_changed.bind(this))
		this.actions.list.push(action)
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
		this.submitted.notify(this.action)
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
				this.expanded(true) //make sure we expanded
				return true
			}else{
				this.unload()
			}
		}
	},
	preview: function(action, html){
		if(action == this.action){
			this.preview.load(html)
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
	init: function(display, opts){
		this.node = $("<div>")
			.addClass("action")
			.append($("<span>").append(display))
			.click(this._clicked.bind(this))
		
		this.form = { //Defined by subclass
			node: $("<div>")
				.addClass("form")
		}
		
		this.clicked = new Event(this)
		this.changed = new Event(this)
		
		if(opts.title){
			this.node.attr("title", opts.title)
		}
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




