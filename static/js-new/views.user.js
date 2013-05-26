views = window.views || {}

/**
A visual representation of a user.
*/
views.User = Class.extend({
	init: function(model){
		this.model = model
		
		this.node = $("<div>")
			.addClass("user")
			.click(this._handle_click.bind(this))
		
		//Three major subcomponents: Info, Contribs and Talk
		this.info = new views.User.Info(model)
		this.node.append(this.info.node)
		
		this.contribs = new views.User.Contribs(model)
		this.node.append(this.contribs.node)
		
		this.talk = new views.User.Talk(model)
		this.node.append(this.talk.node)
		
		//The only event we care about.  Is someone clicking on me?
		this.clicked = new Event(this)
		
		//When the model is selected, we need to be selected too.
		this.model.selection.attach(
			function(model){
				this.selected(selected)
				this.expanded(selected)
			}.bind(this)
		)
		
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
		}
	},
	expanded: function(expanded){
		if(expanded == undefined){
			return this.node.hasClass("expanded")
		}else{
			expanded = Boolean(expanded) //Force to be either true or false.
			
			if(expanded){
				this.node.addClass("expanded")
			}else{
				this.node.removeClass("expanded")
			}
			this.info.expanded(expanded)
			this.contribs.expanded(expanded)
			this.talk.expanded(expanded)
		}
	},
	_handle_click: function(e){
		this.contribs.clear()
		this.clicked.notify()
	},
	_handle_talk_reload: function(){
		this.talk_reloaded.notify()
	},
	_handle_category_click: function(_, value){
		this.categorized.notify(value)
	},
	_category_changed: function(category){
		this.node.removeClass("good-faith")
		this.node.removeClass("bad-faith")
		this.node.addClass(category.category)
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
views.User.Info = Class.extend({
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
		
		this.user_actions = views.User.Info.UserActions
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
		
		this.model.viewed.attach(this._render.bind(this))
		this.model.activity.changed(this._render.bind(this))
		
		this.expanded(false)
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
				/*this.counts.hide()*/
			}
		}
	},
	_render: function(){
		if(this.model.views > 0){
			this.node.addClass("viewed")
		}
		
		this.counts.render(this.model.activity.counts)
		
		this.meta.render({
			'Registered': this.model.registration.format('wikiDate'),
			'Last activity': this.model.activity.last_activity.format('wikiDate'),
			'Views': this.model.views,
			'Revisions': this.counts.node,
			'Reverted': this.model.reverted
		})
		
		if(this.model.views > 0){
			this.node.addClass("viewed")
		}else{
			this.node.removeClass("viewed")
		}
	}
})
views.User.Info.UserActions = ui.Dropper.extend({
	init: function(model){
		this.model = model
		
		var user = {id: this.model.id, name: this.model.id}
		var formatting = {user_name: this.model.name, user_id: this.model.id}
		
		actions = MEDIAWIKI.user_actions.map(
			function(doc){
				return new ui.UserAction.from_doc(doc, formatting)
			}.bind(this)
		)
		var user = {id: this.model.id, name: this.model.id}
		this.menu = new ui.ActionMenu(this.model, actions)
		this._super("", this.menu.node, {tooltip: "User actions menu -- click to expand"})
		this.changed.attach(this._handle_changed.bind(this))
		
		this.node.addClass("user_actions")
		this.node.addClass("simple")
		
		this.menu.cancelled.attach(this._handle_cancel.bind(this))
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


views.User.Activity = ui.RevisionGraph.extend({
	init: function(model){
		this._super(model.registration, 30)
		this.model = model
		
		this.node.addClass("contribs")
		
		this.grid.load(this.model.activity.revisions.values().map(
			function(revision){
				return new views.User.Activity.Revision(this.model, revision)
			}
		))
		
		this.expanded(false)
	},
	clear: function(){
		this.grid.clear_cursor()
	}
})
views.User.Activity.Revision = ui.DayGrid.Revision.extend({
	init: function(user, revision){
		this._super(this)
		this.user = user
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
views.User.Talk = ui.RevisionGraph.extend({
	init: function(model){
		this.model = model
		
		this.node = $("<div>")
			.addClass("talk")
		
		this.threads = {
			node: $("<div>")
				.addClass("threads")
		}
		this.node.append(this.threads.node)
		
		this.reloader = new ui.Button(
			'reload',
			{
				label: 'reload talk',
				title: "Reloads this user's talk page",
				class: "reloader"
			}
		)
		this.node.append(this.reloader.node)
		
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
			var talk_thread = new views.User.Talk.Thread(
				thread.title,
				thread.classes
			)
			
			this.threads.node.append(talk_thread.node)
		}
	},
	_clear: function(){
		this.threads.node.children().remove()
	}
})
views.User.Talk.Thread = Class.extend({
	init: function(title, classes){
		title = title || ""
		classes = classes || []
		
		this.node = $("<div>")
			.addClass("thread")
		
		icon = $("<dt>")
			.attr('title', classes.join(", "))
			.addClass("thread_icon")
			.addClass(classes.join(" "))
		
		this.node.append(icon)
		this.node.append($('<dd>').text(title))
		
		this.clicked = new Event(this)
	}
})
	
views.User.Category = Class.extend({
	init: function(model){
		this.model = model
		
		this.node = $("<div>")
			.addClass("category")
			
		this.header = {
			node: $("<span>")
				.addClass("header")
				.text("Categorize")
		}
		this.node.append(this.header.node)
		
		this.history = new views.User.Category.History()
		this.node.append(this.history.node)
		
		this.buttons = {
			node: $("<div>")
				.addClass("buttons"),
			good_faith: new ui.Button(
				'good-faith', 
				{
					class: "good-faith",
					label: "&#x2714;",
					attrs: {
						title: "This editor is at least trying to do something useful. (or press #1)"
					}
				}
			),
			ambiguous: new ui.Button(
				'ambiguous', 
				{
					class: "ambiguous",
					label: "?",
					attrs: {
						title: "It's unclear whether this editor is trying to be productive or not. (or press #2)"
					}
				}
			),
			bad_faith: new ui.Button(
				'bad-faith', 
				{
					class: "bad-faith",
					label: "&#x2718;",
					attrs: {
						title: "This editor is trying to cause harm or be disruptive. (or press #3)"
					}
				}
			)
		}
		this.buttons.node.append(this.buttons.good_faith.node)
		this.buttons.node.append(this.buttons.ambiguous.node)
		this.buttons.node.append(this.buttons.bad_faith.node)
		this.node.append(this.buttons.node)
		
		this.buttons.good_faith.clicked.attach(this._button_clicked.bind(this))
		this.buttons.bad_faith.clicked.attach(this._button_clicked.bind(this))
		this.buttons.ambiguous.clicked.attach(this._button_clicked.bind(this))
		
		this.button_clicked = new Event(this)
		
		this.model.changed.attach(this._render.bind(this))
		this.expanded(false)
		this._render()
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
			
			this.buttons.good_faith.disabled(disabled)
			this.buttons.bad_faith.disabled(disabled)
		}
	},
	_button_clicked: function(button){
		this.button_clicked.notify(button.value)
	},
	_render: function(){
		this.buttons.good_faith.selected(this.model.category.category == "good-faith")
		this.buttons.bad_faith.selected(this.model.category.category == "bad-faith")
		this.buttons.ambiguous.selected(this.model.category.category == "ambiguous")
		
		this.history.render(this.model.category.history)
	}
})
views.User.Category.History = ui.Dropper.extend({
	init: function(){
		this._super("history")
		
		this.node.addClass("history")
	},
	_item_node: function(category, timestamp, snuggler){
		snuggler = snuggler || {}
		return $("<li>")
			.addClass("item")
			.append(
				$("<span>")
					.addClass("timestamp")
					.text(new Date(timestamp*1000).format('wikiDate'))
			)
			.append(
				$("<span>")
					.addClass("category")
					.addClass(category)
					.text(category)
			)
			.append(
				$("<a>")
					.addClass("snuggler")
					.text(String(snuggler.name))
					.attr('href', util.user_link(snuggler.name))
					.attr('target', "_blank")
			)
	},
	render: function(history){
		if(!history || history.length == 0){
			this.pane.node.html("")
			this.pane.node.append(
				$("<p>").append(
					LANGUAGE.category["This user has yet to be categorized."]
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
