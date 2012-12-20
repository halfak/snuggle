UI = UI || {}

UI.Button = Class.extend({
	init: function(value, o){
		o = o || {}
		this.value = value
		
		this.node = $("<div>")
			.addClass("button")
			.append($("<span>").append(o.label || ""))
			.click(this._handle_click.bind(this))
	
		if(o.class){
			this.node.addClass(o.class)
		}
		if(o.attrs){
			for(key in o.attrs){
				this.node.attr(key, o.attrs[key])
			}
		}
		
		this.clicked = new Event(this)
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
		this.clicked.notify()
	}
})
