UI = UI || {}

UI.Button = Class.extend({
	init: function(value, opts){
		//Clean inpout
		opts = opts || {}
		if(value === undefined){value = ''}
		this.value = value
		
		//Figure out what the label will be
		if(opts.label === undefined){opts.label = value}
		
		//Create the nodes
		this.node = $("<div>")
			.addClass("button")
			.click(this._clicked.bind(this))
		
		this.label = $("<span>")
			.append(opts.label)
		this.node.append(this.label)
		
		//Consume options
		if(opts.class){
			this.node.addClass(opts.class)
		}
		if(opts.attrs){
			for(key in opts.attrs){
				this.node.attr(key, opts.attrs[key])
			}
		}
		
		//Only event that matters
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
	_clicked: function(e){
		if(!this.disabled()){
			this.clicked.notify()
		}
	}
})
