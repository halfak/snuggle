ui = window.ui || {}

ui.Categorizer = Class.extend({
	init: function(user){
		this.user = user // Expects the user model
		this.view  = new ui.Categorizer.View(this.user.category)
		
		this.node = this.view.node
		
		this.view.activated.attach(this._handle_activation.bind(this))
	},
	select: function(val){
		this.view.expanded(true)
		this.view.categories.select(val)
	},
	expanded: function(expanded){
		this.view.expanded(expanded)
	},
	disabled: function(disabled){
		this.view.disabled(disabled)
	},
	_handle_activation: function(_){
		logger.debug("ui.Categorizer: handling activation")
		if(!SNUGGLE.snuggler.authenticated()){
			alert(i18n.get("You must log in before categorizing users."))
			SNUGGLE.snuggler.ping()
		}else{
			this.view.categories.disabled(true)
			servers.local.users.categorize(
				this.user, 
				{
					category: this.view.categories.val(), 
					comment: this.view.categories.form.comment.val()
				},
				function(doc){
					if(doc){
						this.user.category.load_doc(doc)
					}
					this.view.categories.disabled(false)
					this.view.expanded(false)
				}.bind(this),
				function(message, doc, meta){
					if(doc.code == "permissions"){
							logger.error("Permissions error while trying to change category.")
					}else{
							alert(message)
					}
					this.view.categories.reset()
					this.view.categories.disabled(false)
				}.bind(this)
			)
		}
	}
})

ui.Categorizer.View = ui.Expander.extend({
	init: function(model){
		this.model = model
		
		this.current = {
			node: $("<div>")
				.addClass("current")
		}
		
		this.categories = new ui.Categorizer.View.Categories(this.model)
		this.history    = new ui.Categorizer.View.History(this.model)
		
		this._super({
			label: this.current.node,
			content: $("<div>").append(this.categories.node).append(this.history.node),
			tooltip: i18n.get("Click here to categorize this user"),
			class: "categorizer",
			tabindex: env.tabindex.categorizer
		})
		this.changed.attach(this._handle_expander_change.bind(this))
		
		this.categories.activated.attach(this._handle_categories_activation.bind(this))
		this.categories.form.activated.attach(this._handle_form_activation.bind(this))
		this.categories.form.cancelled.attach(this._handle_form_cancellation.bind(this))
		
		this.model.changed.attach(this._handle_change.bind(this))
		
		this.activated = new Event(this)
		this.cancelled = new Event(this)
		
		this._render()
	},
	_handle_change: function(_){
		this._render()
	},
	_handle_expander_change: function(_){
		if(!this.expanded()){
			this.categories.reset()
			this.categories.form.expanded(false)
			this.history.expanded(false)
		}
	},
	_handle_categories_activation: function(_){
	},
	_handle_form_cancellation: function(_){
		this.categories.reset()
		this.cancelled.notify()
	},
	_handle_form_activation: function(_){
		this.activated.notify()
	},
	_render: function(){
		this.current.node.html("") // Clear
		
		var tooltip = ""
		if(this.model.category){
			tooltip = i18n.get("This user is currently categorized as ") + 
			          i18n.get(this.model.category) + "."
		}else{
			tooltip = i18n.get("This user has not been categorized yet.")
		}
		this.current.node.append(
			$("<div>")
				.addClass("category")
				.addClass("icon")
				.addClass(this.model.category || "uncategorized")
				.text(env.icons[this.model.category] || "")
				.attr('title', tooltip)
		)
	}
})

ui.Categorizer.View.Form = Class.extend({
	init: function(){
		this.node = $("<div>")
			.addClass("form")
		
		this.comment = new ui.TextField(
			"comment", 
			{
				label: i18n.get("comment"),
				tooltip: i18n.get("leave a comment explaining your decision (optional)")
			}
		)
		this.comment.keypressed.attach(this._handle_comment_keypress.bind(this))
		this.node.append(this.comment.node)
		
		this.controls = {
			node: $("<div>")
				.addClass("controls"),
			cancel: new ui.Button({label: "cancel", class: "cancel"}),
			save: new ui.Button({label: "save", class: "save"})
		}
		this.controls.cancel.activated.attach(this._handle_cancel_activation.bind(this))
		this.controls.save.activated.attach(this._handle_save_activation.bind(this))
		this.controls.node.append(this.controls.cancel.node)
		this.controls.node.append(this.controls.save.node)
		this.node.append(this.controls.node)
		
		this.activated = new Event(this)
		this.cancelled = new Event(this)
	},
	_handle_comment_keypress: function(_, e){
		if(e.which == env.keys.ENTER){
			this.activated.notify()
		}
	},
	_handle_cancel_activation: function(_){
		this.clear()
		this.expanded(false)
		this.cancelled.notify()
	},
	_handle_save_activation: function(_){
		this.activated.notify()
	},
	disabled: function(expanded){
		if(disabled === undefined){
			return this.node.hasClass("disabled")
		}else{
			if(disabled){
				this.node.addClass("disabled")
			}else{
				this.node.removeClass("disabled")
			}
			this.comment.disabled(disabled)
			this.controls.cancel.disabled(disabled)
			this.controls.cave.disabled(disabled)
		}
	},
	expanded: function(expanded){
		if(expanded === undefined){
			return this.node.hasClass("expanded")
		}else{
			if(expanded){
				this.node.addClass("expanded")
				this.comment.focus()
			}else{
				this.node.removeClass("expanded")
			}
		}
	},
	clear: function(){
		this.comment.val("")
	}
})

ui.Categorizer.View.Categories = Class.extend({
	init: function(model){
		this.model = model
		
		this.node = $("<div>")
			.addClass("categories")
		
		this.form = new ui.Categorizer.View.Form()
		this.form.cancelled.attach(this._handle_form_cancel.bind(this))
		this.form.expanded(false)
		this.node.append(this.form.node)
		
		this.buttons = {
			'good-faith': new ui.Button({
				label: i18n.get(env.icons['good-faith']),
				tooltip: i18n.get("This user is at least trying to do something useful (or press #1)"),
				value: "good-faith",
				class: "category icon good-faith",
				tabindex: env.tabindex.categorizer
			}),
			ambiguous: new ui.Button({
				label: i18n.get(env.icons['ambiguous']),
				tooltip: i18n.get("Its unclear whether this editor is trying to be productive or not (or press #2)"),
				value: "ambiguous",
				class: "category icon ambiguous",
				tabindex: env.tabindex.categorizer
			}),
			'bad-faith': new ui.Button({
				label: i18n.get(env.icons['bad-faith']),
				tooltip: i18n.get("This editor is trying to cause harm or be disruptive (or press #3)"),
				value: "bad-faith",
				class: "category icon bad-faith",
				tabindex: env.tabindex.categorizer
			})
		}
		for(name in this.buttons){
			var button = this.buttons[name]
			button.activated.attach(this._handle_button_activation.bind(this))
			this.node.append(button.node)
		}
		this.selection = null
		
		this.model.changed.attach(this._handle_change.bind(this))
		
		this.changed   = new Event(this)
		this.activated = new Event(this)
		this._render()
	},
	_handle_button_activation: function(button){
		this._select(button)
		this.activated.notify()
	},
	_handle_change: function(){
		this._render()
	},
	_handle_form_cancel: function(){
		this.reset()
	},
	val: function(val){
		if(val === undefined){
			if(this.selection){
				return this.selection.value
			}else{
				return null
			}
		}else{
			if(!val || this.buttons[val]){
				this._select(this.buttons[val])
			}else{
				throw "No category value " + val
			}
		}
	},
	reset: function(){
		this.form.clear()
		this.form.expanded(false)
		this._render()
	},
	select: function(val){
		this.val(val)
		this.activated.notify()
	},
	_select: function(button, notify){
		if(button){
			if(button.value != this.model.category){
				this.form.expanded(true)
			}else{
				this.form.expanded(false)
			}
		}
		if(button !== this.selection){
			if(this.selection){
				this.selection.selected(false)
				this.selection = null
			}
			if(button){
				this.selection = button
				logger.debug("ui.categorizer: Setting selection of button " + button.value)
				this.selection.selected(true)
			}
			this.changed.notify()
		}
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
			for(name in this.buttons){
				this.buttons[name].disabled(disabled)
			}
		}
	},
	_render: function(){
		this.val(this.model.category)
	}
})


ui.Categorizer.View.History = Class.extend({
	init: function(model){
		this.model = model
		
		this.node = $("<div>")
			.addClass("history")
		
		this.tab = {
			node: $("<div>")
				.addClass("tab")
				.append(
					$("<span>")
						.append($("<span>").addClass("icon").html(i18n.get(env.icons['history'])))
						.append($("<span>").addClass("header").html(i18n.get("categorization history")))
				)
				.click(this._handle_tab_click.bind(this))
		}
		this.node.append(this.tab.node)
		
		this.history = {
			node: $("<div>")
				.addClass("history")
		}
		this.node.append(this.history.node)
		
		this._render()
	},
	_handle_tab_click: function(e){
		this.expanded(!this.expanded())
		util.stop_propagation(e)
	},
	expanded: function(expanded){
		if(expanded === undefined){
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
		this.history.node.html("") // Clears history space
		if(this.model.history.length == 0){
			this.history.node.append(
				$("<span>")
					.html(i18n.get("This user has not been categorized yet."))
			)
		}else{
			var table = $("<table>")
			// Iterate backwards through history
			for(var i=this.model.history.length-1;i>=0;i--){
				var categorization = this.model.history[i]
				var row = $("<tr>")
				row.append(
					$("<td>")
						.addClass("category")
						.append(
							$("<div>")
								.addClass("category")
								.addClass(categorization.category)
								.append(env.icons[categorization.category])
						)
				)
				row.append(
					$("<td>")
						.addClass("timestamp")
						.html(categorization.timestamp.format('wikiDate'))
				)
				row.append(
					$("<td>")
						.addClass("snuggler")
						.append(util.wiki_link(
							util.page_name(2, categorization.snuggler.name),
							categorization.snuggler.name
						))
				)
				
				// Comment logic (special for empty case)
				var comment_td = $("<td>").addClass("comment")
				if(categorization.comment){
					comment_td.text(categorization.comment)
				}else{
					comment_td.text("(no comment)").addClass("empty")
				}
				row.append(comment_td)
				
				table.append(row)
			}
			this.history.node.append(table)
		}
	}
})
