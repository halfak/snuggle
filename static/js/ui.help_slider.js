ui = window.ui || {}

ui.HelpSlider = Class.extend({
	init: function(content){
		this.node = $("<div>")
			.addClass("help_slider")
			.click(util.stop_propagation)
		
		this.pane = {
			node: $("<div>")
				.addClass("pane")
				.addClass("help_content")
		}
		
		this.tab = {
			node: $("<div>")
				.addClass("tab")
				.addClass("clickable")
				.append(i18n.get("help"))
		}
		this.tab.node.click(this._handle_click.bind(this))
		
		$("body").click(this._handle_body_click.bind(this))
		
		this.load_content(content)
	},
	_handle_click: function(){
		this.toggle()
	},
	_handle_body_click: function(e){
		this.expanded(false)
	},
	load_content: function(content){
		this.pane.node.html(content)
	},
	toggle: function(){
		this.expanded(!this.expanded())
	},
	expanded: function(expand){
		if(expand === undefined){
			return this.node.hasClass("expanded")
		}else{
			if(expand){
				this.pane.node.animate(
					{"max-height": "400px"},
					300
				)
				this.node.addClass("expanded")
			}else{
				this.pane.node.animate(
					{"max-height": "1px"},
					300,
					function(){
						this.node.removeClass("expanded")
					}.bind(this)
				)
				
			}
		}
	}
	
})
