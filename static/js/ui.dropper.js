ui = ui || {}

ui.Dropper = Class.extend({
	/*
	Parameters:
		tab
		content
		opts
			class
			tooltip
			expanded
		}
	
	*/
	init: function(tab, content, opts){
		opts = opts || {}
		
		this.node = $("<div>")
			.addClass("dropper")
			.attr('tabindex', tabindex.dropper)
			
		if(opts.class){this.node.addClass(opts.class)}
		
		this.tab = {
			node: $("<div>")
				.addClass("tab")
				.addClass("clickable")
				.append($("<span>").append(tab || ""))
				.click(this._handle_tab_click.bind(this))
		}
		this.node.append(this.tab.node)
		if(opts.tooltip){
			this.tab.node.attr('title', opts.tooltip)
		}
		
		this.pane = {
			node: $("<div>")
				.addClass("pane")
				.append(content || "")
				.hide()
				.click(function(e){e.stopPropagation()})
		}
		this.node.append(this.pane.node)
		
		if(opts.z_index){
			this.pane.node.attr("z-index", opts.z_index)
		}
		
		//This is experimental.  I'm not sure if it is kosher.
		//Hopefully, if you click on something that doesn't capture the 
		//click event, it will bubble up to the body and then we can 
		//know to close the dropper. 
		$("body").click(this._handle_body_click.bind(this))
		$("body").keydown(this._handle_body_keydown.bind(this))
		
		this.changed = new Event(this)
		
		this.expanded(opts.expanded)
		
	},
	_handle_body_click: function(e){
		this.expanded(false)
	},
	_handle_body_keydown: function(e){
		if(e.which == keys.ESCAPE){
			this.expanded(false)
		}
	},
	_handle_tab_click: function(e){
		this.expanded(!this.expanded())
		e.stopPropagation()
	},
	expanded: function(expanded){
		if(expanded === undefined){
			return this.node.hasClass("expanded")
		}else{
			if(expanded){
				this.node.addClass("expanded")
				this.pane.node.show()
				this.changed.notify(true)
			}else{
				this.pane.node.hide()
				this.node.removeClass("expanded")
				this.changed.notify(false)
			}
		}
	},
	set_content: function(content){
		this.pane.node.children().detach() //Clear out the old content
		this.pane.node.append(content || "")
	}
})


