ui = window.ui || {}

ui.SystemStatus = Class.extend({
	init: function(){
		this.node = $("<div>")
			.addClass("system_status")
		
		this.element = new ui.SystemStatus.Element(
			50,
			[2, 8, 18, 18, 4],
			"Sn",
			"Snuggle",
			118.7
		)
	},
	loading: function(loading){
		if(loading === undefined){
			return this.node.hasClass("loading")
		}else{
			if(loading){
				this.node.addClass("loading")
				this.element.rotate(true)
			}else{
				this.node.removeClass("loading")
				this.element.rotate(false)
			}
		}
	}
})

ui.SystemStatus.Element = Class.extend({
	init: function(number, shells, symbol, name, mass){
		this.node = $("<span>")
			.addClass("element")
			
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
			this._rotate,
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
	}
	_present_shells: function(){
		this.shells.node.html("")
		for(var i=0;i<this.shells.values.length;i++){
			var index = (this.shells.position + i) % this.shells.values.length
			var value = this.shells.values[index]
			this.shells.node.append($("<span>").html(value))
		}
	}
	
})
