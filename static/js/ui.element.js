ui.Element = Class.extend({
	init: function(number, shells, symbol, name, mass){
		this.node = $("<span>")
			.addClass("element")
			.addClass("clickable")
			.click(this._handle_click.bind(this))
			
		this.number = {
			node: $("<span>")
				.addClass("number")
				.html(number)
		}
		this.node.append(this.number.node)
		
		this.shells = {
			node: $("<span>")
				.addClass("shells"),
			values: shells,
			position: 0
		}
		this.node.append(this.shells.node)
			
		this.symbol = {
			node: $("<span>")
				.addClass("symbol")
				.html(symbol)
		}
		this.node.append(this.symbol.node)
			
		this.footer = {
			node: $("<span>")
				.addClass("footer")
				.append($("<span>").addClass("name").html(name))
				.append($("<span>").addClass("mass").html(mass))
		}
		this.node.append(this.footer.node)
		
		this._present_shells()
		
		this.clicked = new Event(this)
	},
	_handle_click: function(){
		if(!this.disabled()){
			this.clicked.notify()
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
		}
	},
	rotate: function(rotate){
		if(rotate === undefined){
			return Boolean(this.rotation_delay)
		}else{
			this._stop_rotation()
			if(rotate){
				this._rotate()
			}
		}
	},
	_rotate: function(){
		this._rotation_delay = setTimeout(
			this._rotate.bind(this),
			env.delays.element_rotation
		)
		
		//Position loop
		this.shells.position = (this.shells.position + 1) % this.shells.values.length
		this._present_shells()
	},
	_stop_rotation: function(){
		if(this._rotation_delay){
			clearTimeout(this._rotation_delay)
		}
		this.shells.position = 0
		this._present_shells()
	},
	_present_shells: function(){
		this.shells.node.html("")
		for(var i=0;i<this.shells.values.length;i++){
			var index = (this.shells.position + i) % this.shells.values.length
			var value = this.shells.values[index]
			this.shells.node.append($("<span>").html(value))
		}
	}
	
})
