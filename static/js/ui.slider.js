UI.Slider = Class.extend({
	init: function(node){
		this.node = node
			.click(function(e){e.stopPropagation()})
		
		this.pane = {
			node: node.find(".pane")
		}
		
		this.tab = {
			node: node.find(".tab")
		}
		
		this.tab.node.click(this.toggle.bind(this))
		
		
		$("body").click(function(e){this.expanded(false)}.bind(this))
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
					{"max-height": "20em"},
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
