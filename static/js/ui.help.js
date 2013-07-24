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
				.click(this._handle_click.bind(this))
		}
		this.node.append(this.tab.node)
		
		$("body").click(this._handle_body_click.bind(this))
		$(window).resize(this._handle_window_resize.bind(this))
	},
	_handle_click: function(){
		this.toggle()
	},
	_handle_body_click: function(e){
		this.expanded(false)
	},
	_handle_window_resize: function(e){
		if(this.expanded()){
			this.pane.node.css('height', window.innerHeight - 30)
		}
	},
	toggle: function(){
		this.expanded(!this.expanded())
	},
	expanded: function(expand){
		if(expand === undefined){
			return this.node.hasClass("expanded")
		}else{
			if(expand){
				logger.debug("ui.help: expanding")
				this.pane.node.animate(
					{"height": window.innerHeight - 30},
					200
				)
				this.node.addClass("expanded")
			}else{
				logger.debug("ui.help: contracting")
				this.pane.node.animate(
					{"height": "1px"},
					200,
					function(){
						this.node.removeClass("expanded")
					}.bind(this)
				)
				
			}
		}
	}
	
})
