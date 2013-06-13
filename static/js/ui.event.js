ui = window.ui || {}

ui.Event = Class.extend({
	init: function(model, view){
		this.model = model
		this.view = view
		
		this.node = this.view.node
	}
})
ui.Event.TYPES = {}
ui.Event.stringify_type = function(type){
	return JSON.stringify(type.entity) + "|" + JSON.stringify(type.action)
}
ui.Event.from_doc = function(doc){
	var string_type = ui.Event.stringify_type(doc.type)
	var Class = ui.Event.TYPES[string_type]
	
	if(!Class){
		throw "Event class not found " + string_type
	}else{
		return Class.from_doc(doc)
	}
}
ui.Event.Model = Class.extend({
	init: function(system_time){
		this.system_time = system_time
	}
})
ui.Event.View = Class.extend({
	init: function(model){
		this.model = model
		
		this.node = $("<div>")
			.addClass("event")
		
		this.system_time = {
			node: $("<div>")
				.addClass("system_time")
				.html("<span>" + this.model.system_time.format("wikiDate") + "</span>")
		}
		this.node.append(this.system_time.node)
		
		this.summary = {
			node: $("<div>")
				.addClass("summary")
		}
		this.node.append(this.summary.node)
	}
})


ui.UserCategorized = ui.Event.extend({
	init: function(model, view){
		model = model || new ui.UserCategorized.Model()
		this._super(
			model,
			view || new ui.UserCategorized.View(model)
		)
	}
})
ui.Event.TYPES[ui.Event.stringify_type({entity: "user", action: "categorized"})] = ui.UserCategorized
ui.UserCategorized.from_doc = function(doc){
	var model = new ui.UserCategorized.Model(
		new Date(doc.system_time*env.miliseconds.SECOND),
		doc.snuggler, 
		doc.user, 
		doc.category
	)
	return new ui.UserCategorized(model)
}
ui.UserCategorized.Model = ui.Event.Model.extend({
	init: function(system_time, snuggler, user, category){
		this._super(system_time)
		
		this.snuggler  = snuggler
		this.user     = user
		this.category = category
	}
})
ui.UserCategorized.View = ui.Event.View.extend({
	init: function(model){
		this._super(model)
		// _super inits this.node and this.description.node
		
		this.node.addClass('user_categorized')
		
		this.snuggler = {
			node: $("<a>")
				.addClass("snuggler")
				.attr("target", "_blank")
				.attr('href', util.user_href(this.model.snuggler.name))
				.html(this.model.snuggler.name)
		}
		this.summary.node.append(this.snuggler.node)
		
		this.summary.node.append(" <span>" + i18n.get("categorized") + "</span> ")
		
		this.user = new ui.UserContainer(this.model.user)
		this.summary.node.append(this.user.node)
		
		this.summary.node.append(" <span>" + i18n.get("as") + "</span> ")
		
		this.category = {
			node: $("<span>")
				.addClass("category")
				.addClass(this.model.category)
				.html(i18n.get(this.model.category))
		}
		this.summary.node.append(this.category.node)
	}
})

ui.UserActioned = ui.Event.extend({
	init: function(model, view){
		model = model || new ui.UserActioned.Model()
		this._super(
			model,
			view || new ui.UserActioned.View(model)
		)
	}
})
ui.Event.TYPES[ui.Event.stringify_type({entity: "user", action: "actioned"})] = ui.UserActioned
ui.UserActioned.from_doc = function(doc){
	model = new ui.UserActioned.Model(
		new Date(doc.system_time*env.miliseconds.SECOND),
		doc.snuggler,
		doc.request,
		doc.results
	)
	
	return new ui.UserActioned(model)
}
ui.UserActioned.Model = ui.Event.Model.extend({
	init: function(system_time, snuggler, request, results){
		this._super(system_time)
		this.snuggler = snuggler
		this.request  = request
		this.results  = results
	}
})
ui.UserActioned.View = ui.Event.View.extend({
	init: function(model){
		this._super(model)
		// _super inits this.node and this.summary.node
		
		this.node.addClass("user_actioned")
		
		this.snuggler = {
			node: $("<a>")
				.addClass("snuggler")
				.attr('target', "_blank")
				.attr('href', util.user_href(this.model.snuggler.name))
				.text(this.model.snuggler.name)
		}
		this.user = new ui.UserContainer(this.model.request.user)
		this._sequence_action_summary()
		
		
	},
	_sequence_action_summary: function(){
		// Find out if an action with this name is configured. 
		var action_doc = configuration.mediawiki.user_actions.actions[
			this.model.request.action_name
		]
		if(!action_doc){
			throw "No action defined with action_name " + this.model.request.action_name
		}
		var summary = action_doc.summary || ""
		var last_index = 0
		while((match = ui.UserActioned.View.ACTORS_RE.exec(summary)) != null){
			// Append the pre-match matter
			if(match.index > last_index){
				this.summary.node.append(
					" <span>" + 
					summary.substr(last_index, match.index-last_index) + 
					"</span> "
				)
			}
			
			// Append the appropriate actor node
			if(match[1] == "snuggler"){
				this.summary.node.append(this.snuggler.node)
			}else if(match[1] == "user"){
				this.summary.node.append(this.user.node)
			}
			
			last_index = match.index + match[0].length
		}
		
		// Append all of the stuff after the last match
		if(last_index < summary.length){
			this.summary.node.append(
				" <span>" + 
				summary.substr(last_index) + 
				"</span> "
			)
		}
	}
})
ui.UserActioned.View.ACTORS_RE = /\%\((user|snuggler)\)s/g


ui.ServerStarted = ui.Event.extend({
	init: function(model, view){
		model = model || new ui.ServerStarted.Model()
		this._super(
			model,
			view || new ui.ServerStarted.View(model)
		)
	}
})
ui.Event.TYPES[ui.Event.stringify_type({entity: "server", action: "started"})] = ui.ServerStarted
ui.ServerStarted.from_doc = function(doc){
	var model = new ui.ServerStarted.Model(
		new Date(doc.system_time*env.miliseconds.SECOND),
		doc.server
	)
	return new ui.ServerStarted(model)
}
ui.ServerStarted.Model = ui.Event.Model.extend({
	init: function(system_time, server){
		this._super(system_time)
		
		this.server = server
	}
})
ui.ServerStarted.View = ui.Event.View.extend({
	init: function(model){
		this._super(model)
		// _super inits this.node and this.summary.node
		
		this.node.addClass('system_started')
		
		this.server = {
			node: $("<span>")
				.addClass("server")
				.text(this.model.server)
		}
		this.summary.node.append(this.server.node)
		this.summary.node.append(" <span>" + i18n.get("server started") + "<span>")
	}
})


ui.ServerStopped = ui.Event.extend({
	init: function(model, view){
		model = model || new ui.ServerStopped.Model()
		this._super(
			model,
			view || new ui.ServerStopped.View(model)
		)
	}
})
ui.Event.TYPES[ui.Event.stringify_type({entity: "server", action: "stopped"})] = ui.ServerStopped
ui.ServerStopped.from_doc = function(doc){
	var model = new ui.ServerStopped.Model(
		new Date(doc.system_time*env.miliseconds.SECOND),
		doc.server,
		new Date(doc.start_time*env.miliseconds.SECOND),
		doc.stats,
		doc.error
	)
	return new ui.ServerStopped(model)
}
ui.ServerStopped.Model = ui.Event.Model.extend({
	init: function(system_time, server, start_time, stats, error){
		this._super(system_time)
		
		this.server     = server
		this.start_time = start_time
		this.stats      = stats
		this.error      = error
	}
})
ui.ServerStopped.View = ui.Event.View.extend({
	init: function(model){
		this._super(model)
		// _super inits this.node and this.summary.node
		
		this.node.addClass('system_started')
		
		this.server = {
			node: $("<span>")
				.addClass("server")
				.text(this.model.server)
		}
		this.summary.node.append(this.server.node)
		this.summary.node.append(" <span>" + i18n.get("server stopped") + "<span>")
	}
})
