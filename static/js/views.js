View = {}

/**
Represents a visual control for managing logged in status as a snuggler

TODO:
* Finish login/logout form functionality
*/
View.Snuggler = Class.extend({
	init: function(model){
		this.model = model
		
		this.node = $("<div>")
			.addClass("snuggler")
			
		this.preamble = {
			node: $("<span>")
				.addClass("preamble")
		}
		this.node.append(this.preamble.node)
		
		this.name = {
			node: $("<a>")
				.addClass("name")
		}
		this.node.append("name")
		
		this.menu = new View.Snuggler.Menu()
	},
	
	/**
	Produces a visual ping to draw the users attention to the element.
	*/
	ping: function(steps, opts){
		opts.duration = opts.duration || 250
		opts.callback = opts.callback || function(){}
		
		if(steps > 0){
			this.node.addClass("pinging")
			setTimeout(function(){this.node.removeClass("pinging")}.bind(this), opts.duration/2)
			setTimeout(function(){this.ping(steps-1, opts)}.bind(this), opts.duration)
		}else{
			opts.callback()
		}
	}
})

View.Snuggler.Menu = UI.Dropper.extend({
	init: function(){
		this._super("", "")
		
		this.login = new View.Snuggler.Login()
		
		this.logout = new View.Snuggler.Logout()
	},
	ready_login: function(){
		this.set_content(this.login.node)
	},
	ready_logout: function(){
		this.set_content(this.logout.node)
	}
})

View.Snuggler.Menu.Login = Class.extend({
	init: function(){
		this.node = $("<div>")
			.addClass("login")
		
		this.preamble = $("<p>")
			.addClass("preamble")
			.text("Log in using your " + SYSTEM.wiki.name + " username and password.")
		
		this.name = new UI.TextField({label: "User name"})
		this.node.append(this.name.node)
		
		this.pass = new UI.TextField({label: "Password", password: true})
		this.node.append(this.pass.node)
	}
})


/**
Represents the menu for selecting a subset and filters.
*/
View.Controls = Class.extend({
	init: function(){
		this.node = $("<div>")
			.addClass("controls")
		
		
		this.container = {
			node: $("<div>")
				.addClass("container")
		}
		this.node.append(this.container.node)
		
		this.categories = new UI.SingleSelect(
			[
				{value: null, label: "unsorted", o: {class: "unsorted"}},
				{value: "good-faith", o: {class: "good-faith"}},
				{value: "bad-faith", o: {class: "bad-faith"}}
			],
			{class: "categories"}
		)
		this.categories.val(null)
		this.container.node.append(this.categories.node)
		
		this.filters = new View.Filters()
		this.container.node.append(this.filters.node)
		this.filters.set_category(this.categories.label())
		
		this.changed = new Event(this)
		
		this.categories.changed.attach(this._handle_change.bind(this))
		this.filters.changed.attach(this._handle_change.bind(this))
	},
	
	/**
	Gets or sets the current value of all menu settings.
	
	:Parameters:
		val : obj
			an object mapping of all values to set
	*/
	val: function(val){
		if(!val){
			return $.extend(
				this.filters.val(),
				{category: this.categories.val()}
			)
		}else{
			this.filters.val(val)
			this.categories.val(val.category)
			
			this.changed.notify(this.val())
		}
	},
	_handle_change: function(){
		this.filters.set_category(this.categories.label()) //update filter view
		
		this.changed.notify(this.val())
	}
})

/**
Represents a set of filters for paring down and sorting a list of users.
*/
View.Filters = Class.extend({
	init: function(){
		this.node = $("<div>")
			.addClass("filters")
		
		this.category = {
			node: $("<span>")
				.addClass("category")
		}
		this.node.append(this.category.node)
		
		this.node.append(" newcomers with more than ")
		
		this.min_edits = new UI.Select(
			"min_edits",
			[
				{value: 1},
				{value: 2},
				{value: 3},
				{value: 4},
				{value: 5},
				{value: 6},
				{value: 7},
				{value: 8},
				{value: 9},
				{value: 10},
				{value: 15},
				{value: 20},
				{value: 25},
				{value: 30},
				{value: 35},
				{value: 40}
			]
		)
		this.node.append(this.min_edits.node)
		
		this.node.append(" edits to ")
		
		this.namespace = new UI.Select(
			"namespace",
			[
				{value: null, label:"any page"},
				{value: 0,  label:"Articles"},
				{value: 1,  label:"Talk"},
				{value: 2,  label:"User"},
				{value: 3,  label:"User_talk"},
				{value: 4,  label:"Wikipedia"},
				{value: 5,  label:"Wikipedia_talk"},
				{value: 6,  label:"File"},
				{value: 7,  label:"File_talk"},
				{value: 8,  label:"Mediawiki"},
				{value: 9,  label:"Mediawiki_talk"},
				{value: 10,  label:"Template"},
				{value: 11,  label:"Template_talk"},
				{value: 12,  label:"Help"},
				{value: 13,  label:"Help_talk"},
				{value: 14,  label:"Category"},
				{value: 15,  label:"Category_talk"}
			]
			
		)
		this.node.append(this.namespace.node)
		
		this.node.append(" sorted by ")
		
		this.sorted_by = new UI.Select(
			"sorted_by",
			[
				//{value: "predicted quality"}, Sadly, not ready yet
				{value: "registration", label: "registration date"},
				{value: "reverted", label: "reverted edits"},
				{value: "counts.all", label: "total edits"}
			]
		)
		this.node.append(this.sorted_by.node)
		
		this.node.append(":")
		
		this.direction = new UI.Radios(
			"direction",
			[
				{value: "ascending"},
				{value: "descending"}
			]
		)
		this.direction.val("ascending")
		this.node.append(this.direction.node)
		
		this.changed = new Event(this)
		
		this.min_edits.changed.attach(this._handle_change.bind(this))
		this.namespace.changed.attach(this._handle_change.bind(this))
		this.sorted_by.changed.attach(this._handle_change.bind(this))
		this.direction.changed.attach(this._handle_change.bind(this))
	},
	
	/**
	Sets which subset is being filtered
	*/
	set_category: function(label){
		if(label){
			this.category.node.text(label)
		}
	},
	
	/**
	Gets or sets the current value of all menu settings.
	
	:Parameters:
		val : obj
			an object mapping of all values to set
	*/
	val: function(val){
		if(!val){
			var namespace = parseInt(this.namespace.val())
			if(!namespace && namespace !== 0){
				namespace = "all"
			}
			return {
				min_edits: parseInt(this.min_edits.val()),
				namespace: namespace,
				sorted_by: this.sorted_by.val(),
				direction: this.direction.val()
			}
		}else{
			this.category(val.category)
			this.min_edits.val(val.min_edits)
			this.namespace.val(val.namespace)
			this.sorted_by.val(val.sorted_by)
			this.direction.val(val.direction)
		}
	},
	_handle_change: function(element, value){
		this.changed.notify(this.val())
	}
})

View.UserList = Class.extend({
	init: function(model){
		this.model = model
		
		this.users = {}
		
		this.last_view_change = null
		
		this.node = $("<div>")
			.addClass("user_list")
			.scroll(this._handle_view_change.bind(this))
			.resize(this._handle_view_change.bind(this))
		
		this._appended(null, model.list)
		
		this.model.appended.attach(this._appended.bind(this))
		this.model.cleared.attach(this._cleared.bind(this))
		this.model.is_loading.attach(this._is_loading.bind(this))
		this.model.user_selected.attach(this._show_user.bind(this))
		
		this.view_changed      = new Event(this)
		this.user_clicked      = new Event(this)
		this.user_categorized  = new Event(this)
	},
	/**
	Generates the ranges of the current view pane.
	*/
	view: function(){
		return {
			top: this.node.scrollTop(),
			bottom: this.node.scrollTop()+this.node.height(),
			end: this.node[0].scrollHeight
		}
	},
	/**
	Gets the selected user if there is one.
	*/
	selected: function(){
		if(this.model.select()){
			return this.users[this.model.select().id]
		}else{
			return null
		}
	},
	_show_user: function(_, user){
		var user = this.users[user.id]
		var view = this.view()
		
		if(user){
			if(user.top() < 25){
				this.node.scrollTop(this.node.scrollTop() + user.top() - 25)
			}else if(user.bottom() + 25 > this.node.height()){
				this.node.scrollTop(this.node.scrollTop() + (user.bottom() - this.node.height()) + 25)
			}
		}
	},
	_handle_view_change: function(e){
		this.view_changed.notify(this.view())
	},
	_appended: function(_, users){
		for(var i=0;i<users.length;i++){
			var user_view = new View.User(users[i])
			user_view.clicked.attach(
				function(user_view){
					this.user_clicked.notify(user_view)
				}.bind(this)
			)
			user_view.categorized.attach(
				function(user_view, category){
					this.user_categorized.notify([user_view, category])
				}.bind(this)
			)
			this.node.append(user_view.node)
			this.users[user_view.model.id] = user_view
		}
	},
	_cleared: function(){
		this.node.children().remove()
	},
	_is_loading: function(_, loading){
		if(loading){
			this.node.addClass("loading")
		}else{
			this.node.removeClass("loading")
		}
	}
})
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
			
			this.meta = new UI.DefinitionList()
			this.node.append(this.meta.node)
			
			/*this.counts = new UI.EditCount()
			this.node.append(this.counts.node)
			this.counts.hide()*/
			
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
			this.meta.render({
				'Registered': this.model.registration.format('wikiDate'),
				/*'Has email': this.model.has_email ? "yes" : "no",*/
				/*'Last activity': this.model.last_activity.format('wikiDate'),*/
				'Views': this.model.views
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
				this.reverted(Boolean(this.model.revert))
				
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
				
				//Add classes
				for(var i=0;i<model.classes.length;i++){
					var className = model.classes[i]
					this.node.addClass(className)
				}
				
				this.node.append($("<dt>").attr('title', model.classes.join(", ")))
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
					.text("Sorting")
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
							title: "This editor is at least trying to do something useful. (or press #2)"
						}
					}
				),
				bad_faith: new UI.Button(
					'bad-faith', 
					{
						class: "bad-faith",
						label: "&#x2718;",
						attrs: {
							title: "This editor is trying to cause harm or be disruptive. (or press #1)"
						}
					}
				)
			}
			this.buttons.node.append(this.buttons.bad_faith.node)
			this.buttons.node.append(this.buttons.good_faith.node)
			this.node.append(this.buttons.node)
			
			this.buttons.good_faith.clicked.attach(this._button_clicked.bind(this))
			this.buttons.bad_faith.clicked.attach(this._button_clicked.bind(this))
			
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
