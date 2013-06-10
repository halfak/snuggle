ui = window.ui || {}

ui.UTC = Class.extend({
	init: function(username, has_user, has_talk){
		this.node = $("<div>")
			.addClass("utc")
		
		this.user_page = {
			node: $("<a>")
				.addClass("user_page")
				.text("user")
				.attr("href", util.user_href(username))
				.attr("target", "_blank")
		}
		this.node.append(this.user_page.node)
		if(!has_user){
			this.user_page.node.addClass("does_not_exist")
		}
		
		this.talk_page = {
			node: $("<a>")
				.addClass("talk_page")
				.text("talk")
				.attr("href", util.user_talk_href(username))
				.attr("target", "_blank")
		}
		this.node.append(this.talk_page.node)
		if(!has_talk){
			this.talk_page.node.addClass("does_not_exist")
		}
		
		this.contribs = {
			node: $("<a>")
				.addClass("contribs")
				.text("contribs")
				.attr("href", util.user_contribs_href(username))
				.attr("target", "_blank")
		}
		this.node.append(this.contribs.node)
	},
	hide: function(){
		this.node.hide()
	},
	show: function(){
		this.node.show()
	}
})
