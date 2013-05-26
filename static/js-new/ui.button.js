ui = window.ui || {}

ui.Button = Class.extend({
	init: function(opts){
		opts = opts || {}
		
		if(opts.value){
			this.value = value
		}
		
		//Create the nodes
		this.node = $("<div>")
			.addClass("button")
			.attr('tabindex', opts.tabindex || 1)
			.click(this._handle_click.bind(this))
			.keypress(this._handle_keypress.bind(this))
			.bind("focus blur", this._handle_focus_change.bind(this))
		
		if(opts.tooltip){
			this.node.attr('title', opts.tooltip)
		}
		if(opts.class){
			this.node.addClass(opts.class)
		}
		if(opts.attrs){
			for(key in opts.attrs){
				this.node.attr(key, opts.attrs[key])
			}
		}
		
		this._label = {
			node: $("<span>")
				.addClass("label")
				.append(opts.label || "&nbsp;")
		}
		this.node.append(this._label.node)
		
		//Events
		this.activated = new Event(this)
		this.focus_changed = new Event(this)
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
		}
	},
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
	_handle_click: function(e){
		if(!this.disabled()){
			this.activated.notify()
		}
	},
	_handle_keypress: function(e){
		console.log(e)
		if(e.which == keys.ENTER || e.which == keys.SPACE){
			if(!this.disabled()){
				this.activated.notify()
			}
		}
	},
	_handle_focus_change: function(e){
		this.focus_changed.notify(e.type == "focus")
	}
})
