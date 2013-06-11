ui = window.ui || {}

ui.Help = Class.extend({
	init: function(lang){
		this.lang = lang
		
		this.node = $("<div>")
			.addClass("help_slider")
			.click(util.stop_propagation)
		
		this.pane = {
			node: $("<div>")
				.addClass("pane")
				.append(
					$("<div>").addClass("container")
						.load("doc/" + this.lang + ".help.html .help_content")
				)
		}
		this.node.append(this.pane.node)
		
		this.tab = {
			node: $("<div>")
				.addClass("tab")
				.addClass("clickable")
				.append($("<span>").html(i18n.get("help")))
		}
		this.node.append(this.tab.node)
		this.tab.node.click(this._handle_click.bind(this))
		
		$("body").click(this._handle_body_click.bind(this))
	},
	_handle_click: function(){
		this.toggle()
	},
	_handle_body_click: function(e){
		this.expanded(false)
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
					{"height": "400px"},
					300
				)
				this.node.addClass("expanded")
			}else{
				this.pane.node.animate(
					{"height": "1px"},
					300,
					function(){
						this.node.removeClass("expanded")
					}.bind(this)
				)
				
			}
		}
	}
	
})