ui = window.ui || {}

ui.DefinitionList = Class.extend({
	init: function(cl){
		this.node = $("<div>")
			.addClass("definition_list")
		
		if(cl){
			this.node.addClass(cl)
		}
	},
	hide: function(){
		this.node.hide()
	},
	show: function(){
		this.node.show()
	},
	render: function(map){
		this.node.children().detach() //Clear out the space
		for(key in map){
			this.node.append(
				$("<dl>")
					.addClass(key)
					.append($("<dt>").append(key))
					.append($("<dd>").append(map[key]))
			)
		}
	}
})
