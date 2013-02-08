View = window.View || {}

/**
A visual representation of a user.
*/
View.User = Class.extend({
	init: function(model){
		this.model = model
		
		this.node = $("<div>")
			.addClass("user")
			.click(this._handle_click.bind(this))
		
		//Three major subcomponents: Info, Contribs and Talk
		this.info = new View.User.Info(model.info)
		this.node.append(this.info.node)
		
		this.contribs = new View.User.Contribs(model.contribs)
		this.node.append(this.contribs.node)
		
		this.talk = new View.User.Talk(model.talk)
		this.node.append(this.talk.node)
		
		this.category = new View.User.Category(model.category)
		this.node.append(this.category.node)
		this.category.button_clicked.attach(this._handle_category_click.bind(this))
		
		//The only event we care about.  Is someone clicking on me?
		this.clicked = new Event(this)
		this.categorized = new Event(this)
		
		//When the model is selected, we need to be selected too.
		this.model.selection.attach(
			function(model, selected){
				this.selected(selected)
				this.expanded(selected)
			}.bind(this)
		)
		this.model.category.changed.attach(this._category_changed.bind(this))
		
		
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
			this.category.expanded(expanded)
		}
	},
	_handle_click: function(e){
		this.contribs.clear()
		this.clicked.notify()
	},
	_handle_category_click: function(_, value){
		this.categorized.notify(value)
	},
	_category_changed: function(category){
		this.node.removeClass("good-faith")
		this.node.removeClass("bad-faith")
		this.node.addClass(category.current)
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
	View.User.Info = Class.extend({
		init: function(model){
			this.model = model
			
			this.node = $("<div>")
				.addClass("info")
				
			this.name = {
				node: $("<div>")
					.addClass("name")
					.text(model.name)
			}
			this.node.append(this.name.node)
			
			this.menu = new View.UserMenu()
			this.name.node.append(this.menu.node)
			
			this.meta = new UI.DefinitionList()
			this.node.append(this.meta.node)
			
			this.counts = new UI.EditCounts()
			
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
					this.meta.show()
					/*this.counts.show()*/
				}else{
					this.node.removeClass("expanded")
					this.meta.hide()
					/*this.counts.hide()*/
				}
			}
		},
		_render: function(){
			if(this.model.views > 0){
				this.node.addClass("viewed")
			}
			
			this.counts.render(this.model.counts)
			
			this.meta.render({
				'Registered': this.model.registration.format('wikiDate'),
				/*'Has email': this.model.has_email ? "yes" : "no",*/
				/*'Last activity': this.model.last_activity.format('wikiDate'),*/
				'Views': this.model.views,
				'Revisions': this.counts.node,
				'Reverted': this.model.reverted
			})
			
			if(this.model.views > 0){
				this.node.addClass("viewed")
			}else{
				this.node.removeClass("viewed")
			}
			/*this.counts.render(this.model.counts)*/
		}
	})
	View.User.Contribs = UI.RevisionGraph.extend({
		init: function(model){
			this._super(model.registration, 30)
			this.model = model
			
			this.node.addClass("contribs")
			
			this.grid.load(model.revisions.values().map(
				function(model){
					return new View.User.Contribs.Revision(model)
				}
			))
			
			this.model.revision_added.attach(this._insert_revision.bind(this))
			this.model.revision_replaced.attach(this._replace_revision.bind(this))
			
			this.expanded(false)
		},
		clear: function(){
			this.grid.clear_cursor()
		},
		_insert_revision: function(model){
			this.grid.insert(new View.User.Contribs.Revision(model))
		},
		_replace_revision: function(model){//TODO!!!
			LOGGING.error("I'm not equiped to handle revision replacements yet.")
		}
	})
		View.User.Contribs.Revision = UI.DayGrid.Revision.extend({
			init: function(model){
				this._super(this)
				this.model = model
				
				this.node.addClass("ns_" + this.model.page.namespace)
				this.reverted(Boolean(this.model.revert && !this.model.revert.self))
				
				this.model.reverted.attach(function(_, rvt){this._reverted(rvt)}.bind(this))
			},
			id: function(){return this.model.id},
			page: function(){return this.model.page},
			timestamp: function(){return this.model.timestamp},
			comment: function(){return this.model.comment},
			revert: function(){return this.model.revert},
			reverted: function(reverted){
				if(reverted === undefined){
					return this.node.hasClass("reverted")
				}else{
					reverted = Boolean(reverted)
					if(reverted){
						this.node.addClass("reverted")
					}else{
						this.node.removeClass("reverted")
					}
				}
			},
			_reverted: function(model){
				this.reverted(model.revert !== null)
			}
		})
	View.User.Talk = UI.RevisionGraph.extend({
		init: function(model){
			this.model = model
			
			this.node = $("<div>")
				.addClass("talk")
			
			this.thread_clicked = new Event(this)
			
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
				}else{
					this.node.removeClass("expanded")
				}
			}
		},
		_render: function(){
			this._clear()
			for(var i=0;i<this.model.threads.length;i++){
				var thread = new View.User.Talk.Thread(this.model.threads[i])
				thread.clicked.attach(
					function(thread){
						this.thread_clicked.notify(thread)
					}.bind(this)
				)
				this.node.append(thread.node)
			}
		},
		_clear: function(){
			this.node.children().remove()
		}
	})
		View.User.Talk.Thread = Class.extend({
			init: function(model){
				this.model = model
				
				this.node = $("<div>")
					.addClass("thread")
					.click(
						function(e){
							
						}
					)
				
				icon = $("<dt>")
					.attr('title', model.classes.join(", "))
					.addClass("thread_icon")
					.addClass(model.classes.join(" "))
				
				this.node.append(icon)
				this.node.append($('<dd>').text(model.title))
				
				
				this.clicked = new Event(this)
			}
		})
	
	View.User.Category = Class.extend({
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
			
			this.history = new View.User.Category.History()
			this.node.append(this.history.node)
			
			this.buttons = {
				node: $("<div>")
					.addClass("buttons"),
				good_faith: new UI.Button(
					'good-faith', 
					{
						class: "good-faith",
						label: "&#x2714;",
						attrs: {
							title: "This editor is at least trying to do something useful. (or press #1)"
						}
					}
				),
				ambiguous: new UI.Button(
					'ambiguous', 
					{
						class: "ambiguous",
						label: "?",
						attrs: {
							title: "It's unclear whether this editor is trying to be productive or not. (or press #2)"
						}
					}
				),
				bad_faith: new UI.Button(
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
			this.buttons.good_faith.selected(this.model.current == "good-faith")
			this.buttons.bad_faith.selected(this.model.current == "bad-faith")
			
			this.history.render(this.model.history)
		}
	})
		View.User.Category.History = UI.Dropper.extend({
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
							.addClass("snuggle")
							.text(String(snuggler.name))
							.attr('href', SYSTEM.wiki.root + "/wiki/User:" + snuggler.name)
							.attr('target', "_blank")
					)
			},
			render: function(history){
				if(!history || history.length == 0){
					this.pane.node.html("<p>This user had yet to be categorized.</p>")
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
