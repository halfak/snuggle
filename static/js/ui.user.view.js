// require: ui.user.js

ui.User.View = Class.extend({
	init: function(model){
		this.model = model
		
		this.node = $("<div>")
			.addClass("user")
			.attr('tabindex', env.tabindex.user)
			.focus(this._handle_focus.bind(this))
			.keydown(this._handle_keydown.bind(this))
		
		this.container = {
			node: $("<div>")
				.addClass("container")
		}
		this.node.append(this.container.node)
		
		//Three major subcomponents: Info, Activity and Talk
		this.info = new ui.User.View.Info(model)
		this.container.node.append(this.info.node)
		
		this.activity = new ui.User.View.Activity(model)
		this.container.node.append(this.activity.node)
		
		this.talk = new ui.User.View.Talk(model)
		this.container.node.append(this.talk.node)
		
		this.model.selected_changed.attach(this._handle_selected_change.bind(this))
		
		//Events for parents to know about
		this.focus_set  = new Event(this)
		this.keypressed = new Event(this)
		
		this.manual_focus = false
		
	},
	_handle_focus: function(e){
		// note that clicking causes focus
		if(this.manual_focus){
			this.manual_focus = false
		}else{
			this.focus_set.notify()
		}
	},
	_handle_keydown: function(e){
		this.keypressed.notify(e)
	},
	_handle_selected_change: function(){
		this.selected(this.model.selected())
		this.expanded(this.model.selected())
	},
	selected: function(selected){
		if(selected === undefined){
			return this.node.hasClass("selected")
		}else{
			if(selected){
				this.node.addClass("selected")
			}else{
				this.node.removeClass("selected")
			}
			this.focused(selected)
		}
	},
	focused: function(focused){
		if(focused == undefined){
			return this.node.is(":focus")
		}else{
			if(focused){
				this._manual_focus()
			}else{
				this.node.blur()
			}
		}
	},
	_manual_focus: function(){
		this.manual_focus = true
		this.node.focus()
	},
	expanded: function(expanded){
		if(expanded == undefined){
			return this.node.hasClass("expanded")
		}else{
			if(expanded){
				this.node.addClass("expanded")
			}else{
				this.node.removeClass("expanded")
			}
			this.info.expanded(expanded)
			this.activity.expanded(expanded)
			this.talk.expanded(expanded)
		}
	},
	set_index: function(index){
		this.node.attr('tabindex', index)
	},
	top: function(){
		return this.node.position().top
	},
	bottom: function(){
		return this.top() + this.height()
	},
	height: function(){
		return this.node.outerHeight(true)
	}
})
ui.User.View.Info = Class.extend({
	init: function(model){
		this.model = model
		
		this.node = $("<div>")
			.addClass("info")
			
		this.name = {
			node: $("<div>")
				.addClass("name")
				.text(this.model.name)
		}
		this.node.append(this.name.node)
		
		this.category = new ui.Categorizer(this.model)
		this.node.append(this.category.node)
		this.name.node.prepend(this.category.current.node)
		
		this.status = {
			node: $("<div>")
				.addClass("status")
		}
		this.name.node.prepend(this.status.node)
		
		this.actions = new ui.User.View.Info.Actions(this.model)
		this.name.node.append(this.actions.node)
		
		this.utc = new ui.UTC(
			this.model.name, 
			this.model.has_user_page,
			this.model.has_talk_page
		)
		this.node.append(this.utc.node)
		
		this.meta = new ui.DefinitionList()
		this.node.append(this.meta.node)
		
		this.counts = new ui.EditCounts()
		
		this.model.viewed.attach(this._handle_view.bind(this))
		
		this.expanded(false)
		this._render()
	},
	_handle_view: function(){
		this._render()
	},
	_handle_category_change: function(){
		this._render()
	},
	expanded: function(expanded){
		if(expanded == undefined){
			return this.node.hasClass("expanded")
		}else{
			if(expanded){
				this.node.addClass("expanded")
				this.utc.show()
				this.meta.show()
				/*this.counts.show()*/
			}else{
				this.node.removeClass("expanded")
				this.utc.hide()
				this.meta.hide()
				this.actions.expanded(false)
				/*this.counts.hide()*/
			}
		}
	},
	_render: function(){
		if(this.model.views > 0){
			this.node.addClass("viewed")
		}
		
		this.counts.render(this.model, this.model.activity.counts)
		
		this.meta.render({
			'Registered': this.model.registration.format('wikiDate'),
			'Last activity': this.model.activity.last_activity.format('wikiDate'),
			'Views': this.model.views,
			'Revisions': this.counts.node,
			'Reverted': this.model.activity.reverted,
			'Desirability': parseInt(this.model.desirability.likelihood*1000)/1000
		})
		
		if(this.model.views > 0){
			this.node.addClass("viewed")
		}else{
			this.node.removeClass("viewed")
		}
	}
})
ui.User.View.Info.Actions = ui.Dropper.extend({
	init: function(model){
		this.model = model
		
		var formatting = {
			user_id: this.model.id,
			user_name: this.model.name
		}
		
		// Load user actions from the configuration
		actions = configuration.mediawiki.user_actions.display.map(
			function(name){
				var action_doc = configuration.mediawiki.user_actions.actions[name]
				return new ui.UserAction.from_doc(name, action_doc, formatting)
			}
		)
		
		// Construct menu with actions
		this.menu = new ui.ActionMenu(this.model, actions)
		this._super({
			tooltip: "User actions menu -- click to expand",
			content: this.menu.node,
			label: "actions"
		})
		this.changed.attach(this._handle_changed.bind(this))
		
		this.node.addClass("user_actions")
		this.node.addClass("simple")
		
		this.menu.loaded.attach(this._handle_load.bind(this))
		this.menu.submitted.attach(this._handle_submit.bind(this))
		this.menu.cancelled.attach(this._handle_cancel.bind(this))
		
		this.submitted = new Event(this)
		this.loaded    = new Event(this)
	},
	_handle_changed: function(_, expanded){
		if(expanded){
			//this._set_max_width()
		}else{
			this.menu.expanded(false)
		}
	},
	_handle_cancel: function(_){
		this.expanded(false)
	},
	_handle_submit: function(_, action, watch){
		this.submitted.notify(action, watch)
	},
	_handle_load: function(_, action, watch){
		this.loaded.notify(action, watch)
	},
	disabled: function(disabled){
		if(disabled === undefined){
			return this.node.hasClass("disabled")
		}else{
			if(disabled){
				this.node.addClass("disabled")
			}else{
				this.node.removeClass("disabled")
			}
			this.menu.disabled(disabled)
		}
	}
})


ui.User.View.Activity = ui.RevisionGraph.extend({
	init: function(model){
		this._super(model.registration)
		this.model = model
		
		this.node.addClass("activity")
		
		this.grid.load(this.model.activity.revisions.values().map(
			function(revision){
				return new ui.User.View.Activity.Revision(this.model, revision)
			}.bind(this)
		))
		
		this.expanded(false)
	},
	clear: function(){
		this.grid.clear_cursor()
	}
})
ui.User.View.Activity.Revision = ui.DayGrid.Revision.extend({
	init: function(model, revision){
		this._super(this)
		this.model = model
		this.revision = revision
		
		this.node.addClass("ns_" + this.revision.page.namespace)
		if(this.revision.revert){
			this.reverted(
				true,
				this.revision.revert.user.id == this.model.id
			)
		}
		
	},
	id: function(){return this.revision.id},
	page: function(){return this.revision.page},
	timestamp: function(){return this.revision.timestamp},
	comment: function(){return this.revision.comment},
	revert: function(){return this.revision.revert},
	self_revert: function(){
		return (
			this.revision.revert && 
			this.revision.revert.user.id == this.model.id
		)
	},
	reverted: function(reverted, self){
		if(reverted === undefined){
			return this.node.hasClass("reverted")
		}else{
			reverted = Boolean(reverted)
			if(reverted){
				this.node.addClass("reverted")
				if(self){
					this.node.addClass("self")
				}
			}else{
				this.node.removeClass("reverted")
			}
		}
	}
})
ui.User.View.Talk = ui.RevisionGraph.extend({
	init: function(model){
		this.model = model
		
		this.node = $("<div>")
			.addClass("talk")
		
		this.threads = {
			node: $("<div>")
				.addClass("threads")
		}
		this.node.append(this.threads.node)
		
		this.thread_clicked = new Event(this)
		
		this.model.talk.changed.attach(this._render.bind(this))
		this.expanded(false)
		this._render()
	},
	expanded: function(expanded){
		if(expanded == undefined){
			return this.node.hasClass("expanded")
		}else{
			if(expanded){
				this.node.addClass("expanded")
			}else{
				this.node.removeClass("expanded")
			}
		}
	},
	_render: function(){
		this._clear()
		for(var i=0;i<this.model.talk.threads.length;i++){
			var thread = this.model.talk.threads[i]
			var talk_thread = new ui.User.View.Talk.Thread(
				thread.title,
				thread.trace
			)
			
			this.threads.node.append(talk_thread.node)
		}
	},
	_clear: function(){
		this.threads.node.children().remove()
	}
})
ui.User.View.Talk.Thread = Class.extend({
	init: function(title, trace){
		title = title || ""
		
		this.node = $("<div>")
			.addClass("thread")
		
		if(trace){
			var icon = new ui.User.View.Talk.Thread.TraceIcon(trace.name, trace.modifications)
		}else{
			var icon = new ui.User.View.Talk.Thread.NoTraceIcon()
		}
		
		
		this.node.append(icon.node)
		this.node.append($('<dd>').html(util.linkify(title)))
		
		this.clicked = new Event(this)
	}
})
ui.User.View.Talk.Thread.NoTraceIcon = Class.extend({
	init: function(){
		this.node = $("<dt>")
			.addClass("trace_icon")
			.addClass("no_trace")
	}
})
ui.User.View.Talk.Thread.TraceIcon = Class.extend({
	init: function(name, modifications){
		this.node = $("<dt>")
			.addClass("trace_icon")
		
		this.label = {
			node: $("<span>")
				.addClass("label")
		}
		this.node.append(this.label.node)
		this.superscript = {
			node: $("<span>")
				.addClass("superscript")
		}
		this.node.append(this.superscript.node)
		
		var config_doc = configuration.mediawiki.talk_threads.traces[name]
		if(!config_doc){
			this.node.addClass("unknown")
				.attr('title', i18n.get("Unknown conversation type") + ": " + name)
		}else{
			this.node.attr('title', config_doc.icon.tooltip)
			if(config_doc.icon.label){
				this.label.node.html(config_doc.icon.label)
			}
			if(config_doc.icon.superscript){
				this.superscript.node.html(config_doc.icon.superscript)
			}
			if(config_doc.icon.style){
				for(var property in config_doc.icon.style){
					var value = config_doc.icon.style[property]
					if(property == "box-shadow-color"){
						this.node.css("box-shadow", "0px 0px 4px " + value)
					}else{
						this.node.css(property, value)
					}
				}
			}
			
			for(var name in modifications){
				var value = modifications[name]
				console.log()
				if(name == "label"){
					this.label.node.html(value)
				}else if(name == "superscript"){
					this.superscript.node.html(value)
				}else if(name == "tooltip"){
					this.node.attr('title', value)
				}else{
					if(property == "box-shadow-color"){
						this.node.css("box-shadow", "0px 0px 4px " + value)
					}else{
						this.node.css(property, value)
					}
				}
			}
		}
	}
})
	
ui.User.View.Category = Class.extend({
	init: function(model){
		this.model = model
		
		this.node = $("<div>")
			.addClass("category")
		
		this.history = new ui.User.View.Category.History()
		this.node.append(this.history.node)
		
		this.category = new ui.RadioField(
			"category",
			[
				new ui.RadioField.Radio(
					"&#x2713;", "good-faith",
					{
						tooltip: i18n.get("This user is at least trying to do something useful (or press #1)"),
						class: "button-like category good-faith"
					}
				),
				new ui.RadioField.Radio(
					"?", "ambiguous",
					{
						tooltip: i18n.get("Its unclear whether this editor is trying to be productive or not (or press #2)"),
						class: "button-like category ambiguous"
					}
				),
				new ui.RadioField.Radio(
					"&#x2718;", "bad-faith",
					{
						tooltip: i18n.get("This editor is trying to cause harm or be disruptive (or press #3)"),
						class: "button-like category bad-faith"
					}
				),
			],
			{
				label: i18n.get("Categorize"),
				tooltip: i18n.get("categorize this user based on their activity")
			}
		)
		this.category.changed.attach(this._handle_change.bind(this))
		this.node.append(this.category.node)
		
		this.changed = new Event(this)
		
		this.model.category.changed.attach(this._render.bind(this))
		
		this.expanded(false)
		this._render()
	},
	_handle_change: function(_){
		logger.debug("view.user.category: Notifying a category change.")
		this.changed.notify()
	},
	val: function(value){
		return this.category.val(value)
	},
	expanded: function(expanded){
		if(expanded == undefined){
			return this.node.hasClass("expanded")
		}else{
			if(expanded){
				this.node.addClass("expanded")
				this.node.show()
			}else{
				this.node.removeClass("expanded")
				this.node.hide()
			}
		}
	},
	disabled: function(disabled){
		if(disabled === undefined){
			return this.hasClass("disabled")
		}else{
			if(disabled){
				this.node.addClass("disabled")
			}else{
				this.node.removeClass("disabled")
			}
			
			this.category.disabled(disabled)
		}
	},
	reset: function(){
		this.category.val(this.model.category)
	},
	_render: function(){
		this.category.val(this.model.category.category)
		
		this.history.render(this.model.category.history)
	}
})
ui.User.View.Category.History = ui.Dropper.extend({
	init: function(){
		this._super({label:"history"})
		
		this.node.addClass("history")
	},
	_item_node: function(category, timestamp, snuggler){
		snuggler = snuggler || {}
		return $("<li>")
			.addClass("item")
			.append(
				$("<span>")
					.addClass("timestamp")
					.text(timestamp.format('wikiDate'))
			)
			.append(
				$("<a>")
					.addClass("snuggler")
					.text(String(snuggler.name))
					.attr('href', util.user_href(snuggler.name))
					.attr('target', "_blank")
			)
			.append(
				$("<span>")
					.addClass("category")
					.addClass(category)
					.text(category)
			)
	},
	render: function(history){
		if(!history || history.length == 0){
			this.pane.node.html("")
			this.pane.node.append(
				$("<p>").append(
					i18n.get("This user has not been categorized yet.")
				)
			)
		}
		else{
			this.pane.node.html("")
			var ul = $("<ul>")
			this.pane.node.append(ul)
			for(var i=0;i<history.length;i++){
				var cat = history[i]
				ul.append(this._item_node(cat.category, cat.timestamp, cat.snuggler))
			}
		}
	}
})


