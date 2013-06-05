ui.Event = Class.extend({
	init: function(model, view){
		this.model = model
		this.view = view
		
		this.node = this.view.node
	}
})
ui.Event.TYPES = {}
ui.Event.from_doc = function(doc){
	Class = ui.Event.TYPES[doc.type]
	
	if(!Class){
		throw "Event class not found " + doc.type
	}else{
		Class.from_doc(doc)
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
		}
		this.node.append(this.system_time.node)
		
		this.summary = {
			node: $("<div>")
				.addClass("summary")
		}
		this.node.append(this.summary.node)
	}
})


ui.Categorization = ui.Event.extend({
	init: function(model, view){
		model = model || new ui.Categorization.Model()
		this._super(
			model,
			view || new ui.Categorization.View(model)
		)
	}
})
ui.Categorization.from_doc = function(doc){
	var model = new ui.Categorization.Model(
		new Date(doc.system_time*miliseconds.SECOND),
		doc.snuggler, 
		doc.user, 
		doc.category
	)
	return new ui.Categorization(model)
}
ui.Categorization.Model = ui.Event.Model.extend({
	init: function(system_time, snuggler, user, category){
		this._super(system_time)
		
		this.snuggler  = snuggler
		this.user     = user
		this.category = category
	}
})
ui.Categorization.View = ui.Event.View.extend({
	init: function(model){
		this._super(model)
		// _super inits this.node and this.description.node
		
		this.node.addClass('categorization')
		
		this.snuggler = {
			node: $("<a>")
				.addClass("snuggler")
				.attr("target", "_blank")
				.html(this.model.snuggler.name)
		}
		this.summary.node.append(this.snuggler.node)
		
		this.summary.node.append(" <span>" + i18n.get("categorized") + "</span> ")
		
		this.user = new ui.UserContainer(
			this.model.user.id, 
			this.model.user.name
		)
		this.summary.node.append(this.user.node)
		
		this.summary.node.append(" <span>" + i18n.get("as") + "</span> ")
		
		this.category = {
			node: $("<div>")
				.addClass("category")
				.addClass(this.model.category)
				.html(i18.get(this.model.category))
		}
		this.summary.node.append(this.category.node)
	}
})

ui.UserAction = ui.Event.extend({
	init: function(model, view){
		model = model || new ui.UserAction.Model()
		this._super(
			model,
			view || new ui.UserAction.View(model)
		)
	}
})
ui.UserAction.from_doc = function(doc){
	model = new ui.UserAction.Model(
		new Date(doc.system_time*miliseconds.SECOND),
		doc.snuggler,
		doc.request,
		doc.results
	)
	
	return new ui.UserAction(model)
}
ui.UserAction.Model = ui.Event.Model.extend({
	init: function(system_time, snuggler, request, results){
		this._super(system_time)
		this.snuggler = snuggler
		this.request  = request
		this.results  = results
	}
})
ui.UserAction.View = ui.Event.View.extend({
	init: function(model){
		this._super(model)
		
		this.node.addClass("user_action")
		
		this.snuggler = {
			node: $("<a>")
				.addClass("snuggler")
				.attr('target', "_blank")
				.attr('href', util.user_link(this.model.snuggler.name))
				.text(this.model.snuggler.name)
		}
		this.user = new ui.UserContainer(
			this.model.request.user.id, 
			this.model.request.user.name
		)
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
		while((match = ui.UserAction.View.ACTORS_RE.exec(summary) != null)){
			// Append the pre-match matter
			if(match.index > last_index){
				this.summary.node.append(
					" <span>" + 
					summary.substr(last_index, match.index) + 
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
ui.UserAction.View.ACTORS_RE = /\%\((user|snuggler)\)s/g
