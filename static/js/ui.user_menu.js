/*
var menu = new UI.UserMenu(
	"actions",
	[
		{tab: "message", pane: UI.Message()},
		{tab: "welcome", pane: UI.Welcome()},
		{tab: "invite", pane: UI.Invite()},
		{tab: "report", pane: UI.Report()}
	]
)
menu.post.attach(function(menu, action){
	server.user_action(
		action.type,
		action.val(),
		function(){
			
		},
		function(code, message){
			
		}
	)
})
*/

UI.Preview = Class.extend({})

UI.UserMenu = UI.Dropper.extend({
	init: function(user, tab, actions){
		this._super(tab, '')
		this.user = user
		
		this.actions = {
			node: $("<div>")
				.addClass("actions")
		}
		
		for(var i in actions){
			var action = actions[i]
			this.actions.node.append(action.node)
			action.selected.attach(this._submitted.bind(this))
			action.submitted.attach(this._submitted.bind(this)) //Doesn't exist yet
		}
		
	}
})

UI.PostWidget = Class.extend({
	init: function(){
		this.node = $("<div>")
			.addClass("post_widget")
		
		this.input = {
			node: $("<div>")
				.addClass("input")
		}
		this.node.append(this.input.node)
		
		this.preview = new UI.PostPreview()
	},
	vsl: function(){},
})
