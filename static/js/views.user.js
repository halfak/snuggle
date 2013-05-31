views = window.views || {}

/**
A visual representation of a user.
*/
views.User = Class.extend({
	init: function(model){
		this.model = model
		
		this.node = $("<div>")
			.addClass("user")
			.attr('tabindex', tabindex.user)
			.focus(this._handle_focus.bind(this))
			.keydown(this._handle_keydown.bind(this))
		
		//Three major subcomponents: Info, Activity and Talk
		this.info = new views.User.Info(model)
		this.node.append(this.info.node)
		
		this.activity = new views.User.Activity(model)
		this.node.append(this.activity.node)
		
		this.talk = new views.User.Talk(model)
		this.node.append(this.talk.node)
		
		this.model.selected_changed.attach(this._handle_selected_change.bind(this))
		
		//The only event we care about.  Is someone clicking on me?
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
		
		this.current_category = {
			node: $("<div>")
				.addClass("current_category")
		}
		this.name.node.prepend(this.current_category.node)
		
		this.actions = new views.User.Info.Actions(this.model)
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
		
		this.category = new views.User.Category(model)
		this.node.append(this.category.node)
		
		this.model.viewed.attach(this._handle_view.bind(this))
		this.model.category.changed.attach(this._handle_category_change.bind(this))
		
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
			this.category.expanded(expanded)
		}
	},
	_render: function(){
		if(this.model.views > 0){
			this.node.addClass("viewed")
		}
		
		
		this.current_category.node.html("")
		if(this.model.category.category){
			switch(this.model.category.category){
				case "good-faith": 
					this.current_category.node.append("&#x2713;")
				case "ambiguous":
					this.current_category.node.append("?")
				case "bad-faith":
					this.current_category.node.append("&#x2718;")
				default:
					this.current_category.node.append(this.model.category.category)
			}
			this.current_category.node.addClass("categorized")
		}else{
			this.current_category.node.removeClass("categorized")
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
views.User.Info.Actions = ui.Dropper.extend({
	init: function(model){
		this.model = model
		
		var user = {id: this.model.id, name: this.model.id}
		var formatting = {user_name: this.model.name, user_id: this.model.id}
		
		actions = configuration.mediawiki.user_actions.map(
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


views.User.Activity = ui.RevisionGraph.extend({
	init: function(model){
		this._super(model.registration, 30)
		this.model = model
		
		this.node.addClass("activity")
		
		this.grid.load(this.model.activity.revisions.values().map(
			function(revision){
				return new views.User.Activity.Revision(this.model, revision)
			}.bind(this)
		))
		
		this.expanded(false)
	},
	clear: function(){
		this.grid.clear_cursor()
	}
})
views.User.Activity.Revision = ui.DayGrid.Revision.extend({
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
		
		this.history = new views.User.Category.History()
		this.node.append(this.history.node)
		
		this.category = new ui.RadioField(
			"category",
			[
				new ui.RadioField.Radio(
					"&#x2713;", "good-faith",
					{
						tooltip: i18n.get("This user is at least trying to do something useful (or press #1)"),
						class: "button-like good-faith"
					}
				),
				new ui.RadioField.Radio(
					"?", "ambiguous",
					{
						tooltip: i18n.get("Its unclear whether this editor is trying to be productive or not (or press #2)"),
						class: "button-like ambiguous"
					}
				),
				new ui.RadioField.Radio(
					"&#x2718;", "bad-faith",
					{
						tooltip: i18n.get("This editor is trying to cause harm or be disruptive (or press #3)"),
						class: "button-like bad-faith"
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
		this.category.val(this.model.category)
		
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
					i18n.get("This user has yet to be categorized.")
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
