ui = window.ui || {}

ui.Popover = Class.extend({
	init: function(content){
		this.node = $("<div>")
			.addClass("popover")
			
		this.pane = {
			node: $("<div>")
				.addClass("pane")
		}
		this.node.append(this.pane.node)
		
		if(content){
			this.set_content(content)
		}
	},
	visible: function(visible){
		if(visible === undefined){
			return this.node.css("display") != "none"
		}else{
			logger.debug("ui.popover: setting visibility to " + Boolean(visible))
			if(visible){
				this.node.show()
			}else{
				this.node.hide()
			}
		}
	},
	set_content: function(content){
		this.pane.node.html(content)
	}
})

ui.Welcome = ui.Popover.extend({
	init: function(){
		this._super()
		this.node.addClass("welcome")
		
		this.event_browser = new ui.EventBrowser()
		this.event_browser.load()
		this.pane.node.append(this.event_browser.node)
		
		this.prose = {
			node: $("<div>")
				.addClass("prose")
		}
		this.pane.node.append(this.prose.node)
		
		this.element = new ui.Element(
			50,
			[2, 8, 18, 18, 4],
			"Sn",
			"Snuggle",
			118.7
		)
		this.element.clicked.attach(this._handle_element_click.bind(this))
		this.prose.node.append(this.element.node)
		
		
		this.content = {
			node: $("<div>")
				.addClass("content")
				.load("doc/" + i18n.get("lang") + ".welcome.html .welcome_content")
		}
		this.prose.node.append(this.content.node)
		
		
		this.continue = new ui.Button({
			label: i18n.get("start snuggle"), 
			class: "continue",
			tooltip: i18n.get("load up the list of newcomers")
		})
		this.continue.activated.attach(this._handle_continue_activation.bind(this))
		this.prose.node.append(this.continue.node)
		
		this.start = new Event(this)
	},
	_handle_continue_activation: function(){
		this.start.notify()
	},
	_handle_element_click: function(){
		this.start.notify()
	}
})
