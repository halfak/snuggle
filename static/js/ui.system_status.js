ui = window.ui || {}

ui.SystemStatus = Class.extend({
	init: function(){
		this.node = $("<div>")
			.addClass("system_status")
		
		this.element = new ui.Element(
			50,
			[2, 8, 18, 18, 4],
			"Sn",
			"Snuggle",
			118.7
		)
		this.node.append(this.element.node)
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
