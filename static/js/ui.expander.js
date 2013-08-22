ui = window.ui || {}

ui.Expander = Class.extend({
	init: function(opts){
		opts = opts || {}
		
		this.node = $("<div>")
			.addClass("expander")
		
		if(opts.class){
			this.node.addClass(opts.class)
		}
		
		this.container = {
			node: $("<div>")
				.addClass("container")
		}
		this.node.append(this.container.node)
		
		this.tab = new ui.Expander.Tab(opts)
		this.tab.activated.attach(this._handle_tab_activation.bind(this))
		this.container.node.append(this.tab.node)
		
		this.content = {
			node: $("<div>")
				.addClass("content")
				.append(opts.content || '')
				.click(this._handle_content_click.bind(this))
		}
		this.container.node.append(this.content.node)
		
		//This is experimental.  I'm not sure if it is kosher.
		//Hopefully, if you click on something that doesn't capture the 
		//click event, it will bubble up to the body and then we can 
		//know to close the dropper. 
		$("body").click(this._handle_body_click.bind(this))
		$("body").keydown(this._handle_body_keydown.bind(this))
		
		this.changed = new Event(this)
	},
	_handle_content_click: function(e){
		util.stop_propagation(e)
	},
	_handle_body_click: function(e){
		this.expanded(false)
	},
	_handle_body_keydown: function(e){
		if(e.which == env.keys.ESCAPE){
			this.expanded(false)
		}
	},
	_handle_tab_activation: function(_){
		this.expanded(!this.expanded())
	},
	set_content: function(content){
		this.content.node.html("")
		this.content.node.append(content)
	},
	expanded: function(expanded){
		if(expanded === undefined){
			return this.node.hasClass("expanded")
		}else{
			if(expanded){
				this._freeze_size()
				this.node.addClass("expanded")
			}else{
				this.node.removeClass("expanded")
				this.tab.expanded(expanded)
			}
			this.changed.notify()
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
			this.tab.disabled(disabled)
		}
	},
	_freeze_size: function(){
		this.node.css('height', this.node.height())
		this.node.css('width', this.node.width())
	}
})

ui.Expander.Tab = Class.extend({
	init: function(opts){
		opts = opts || {}
		
		this.node = $("<div>")
			.addClass("tab")
			.click(this._handle_click.bind(this))
			.keypress(this._handle_keypress.bind(this))
			.bind("focus blur", this._handle_focus_change.bind(this))
		
		if(opts.tooltip){
			this.node.attr('title', opts.tooltip)
		}
		this.tabindex = opts.tabindex
		
		this.label = {
			node: $("<span>")
				.addClass("label")
				.html(opts.label || "")
		}
		this.node.append(this.label.node)
		
		this.status = {
			node: $("<span>")
				.addClass("status")
		}
		this.node.append(this.status.node)
		
		//Events
		this.activated = new Event(this)
		this.focus_changed = new Event(this)
	},
	_handle_click: function(e){
		if(!this.disabled()){
			this.activated.notify()
			logger.debug("ui.expander.tab: handling click")
			util.stop_propagation(e)
		}
	},
	_handle_keypress: function(e){
		if(e.which == keys.ENTER || e.which == keys.SPACE){
			if(!this.disabled()){
				this.activated.notify()
				util.stop_propagation(e)
			}
		}
	},
	_handle_focus_change: function(e){
		this.focus_changed.notify(e.type == "focus")
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
				this.node.attr('tabindex', "")
			}else{
				this.node.removeClass("disabled")
				this.node.attr('tabindex', this.tabindex)
			}
		}
	}
})


