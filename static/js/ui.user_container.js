ui = window.ui || {}

ui.UserContainer = Class.extend({
	init: function(id, name){
		this.node = $("<div>")
			.text(name)
	}
})
