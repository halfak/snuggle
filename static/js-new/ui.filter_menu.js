ui = window.ui || {}

/**
Represents the menu for selecting a set of filters for the user_list.
*/
ui.FilterMenu = Class.extend({
	init: function(){
		this.node = $("<div>")
			.addClass("filter_menu")
		
		this.container = {
			node: $("<div>")
				.addClass("container")
		}
		this.node.append(this.container.node)
		
		// Selects a list of users to search through.
		this.categories = new ui.RadioField(
			"categories",
			[
				ui.RadioField.Radio(
					LANGUAGE.filter_menu["uncategorized"].label, null, 
					{
						class: "uncategorized",
						tooltip: LANGUAGE.filter_menu["uncategorized"].tooltip
					}
				),
				ui.RadioField.Radio(
					LANGUAGE.filter_menu["good-faith"].label, "good-faith", 
					{
						class: "good-faith",
						tooltip: LANGUAGE.filter_menu["good-faith"].tooltip
					}
				),
				ui.RadioField.Radio(
					LANGUAGE.filter_menu["ambiguous"].label, "ambiguous", 
					{
						class: "ambiguous",
						tooltip: LANGUAGE.filter_menu["ambiguous"].tooltip
					}
				),
				ui.RadioField.Radio(
					LANGUAGE.filter_menu["bad-faith"].label, "bad-faith", 
					{
						class: "bad-faith",
						tooltip: LANGUAGE.filter_menu["bad-faith"].tooltip
					}
				)
			],
			{class: "categories"}
		)
		this.categories.val(null)
		this.categories.changed.attach(this._handle_categories_change.bind(this))
		this.container.node.append(this.categories.node)
		
		this.filters = new ui.FilterMenu.Filters(this.categories)
		this.filters.changed.attach(this._handle_filters_change.bind(this))
		this.container.node.append(this.filters.node)
		
		this.changed = new Event(this)
	},
	_handle_categories_change: function(_){
		this.changed.notify()
	},
	_handle_filters_change: function(_){
		this.changed.notify()
	},
	filters: function(filters){
		if(!filters){
			return $.extend(
				this.filters.val(),
				{category: this.categories.val()}
			)
		}else{
			this.filters.val(filters)
			this.categories.val(filters.category)
			
			//this.changed.notify(this.val()) not sure this is necessary
		}
	}
})

/**
Represents a set of filters for paring down and sorting a list of users.
*/
ui.FilterMenu.Filters = Class.extend({
	init: function(category){
		// Track changes to category
		category.changed.attach(this._handle_category_changed.bind(this))
		
		this.node = $("<div>")
			.addClass("filters")
		
		this.category = {
			node: $("<span>")
				.addClass("category")
		}
		this.node.append(this.category.node)
		
		this.node.append(
			" " + LANGUAGE.filter_menu.filter["newcomers with more than"] + " "
		)
		
		this.min_edits = new ui.SelectField(
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
		
		this.node.append(" " + LANGUAGE.filter_menu.filter["edits to"] + " ")
		
		this.namespace = new ui.SelectField(
			"namespace",
			[
				{value: null, label: LANGUAGE.filter_menu.filter["any page"]},
				{value: 0,    label: MEDIAWIKI.namespaces[0].name},
				{value: 1,    label: MEDIAWIKI.namespaces[1].name},
				{value: 2,    label: MEDIAWIKI.namespaces[2].name},
				{value: 3,    label: MEDIAWIKI.namespaces[3].name},
				{value: 4,    label: MEDIAWIKI.namespaces[4].name},
				{value: 5,    label: MEDIAWIKI.namespaces[5].name},
				{value: 6,    label: MEDIAWIKI.namespaces[6].name},
				{value: 7,    label: MEDIAWIKI.namespaces[7].name},
				{value: 8,    label: MEDIAWIKI.namespaces[8].name},
				{value: 9,    label: MEDIAWIKI.namespaces[9].name},
				{value: 10,   label: MEDIAWIKI.namespaces[10].name},
				{value: 11,   label: MEDIAWIKI.namespaces[11].name},
				{value: 12,   label: MEDIAWIKI.namespaces[12].name},
				{value: 13,   label: MEDIAWIKI.namespaces[13].name},
				{value: 14,   label: MEDIAWIKI.namespaces[14].name},
				{value: 15,   label: MEDIAWIKI.namespaces[15].name}
			]
			
		)
		this.node.append(this.namespace.node)
		
		this.node.append(" " + LANGUAGE.filter_menu.filter["sorted by"] + " ")
		
		this.sorted_by = new ui.SelectField(
			"sorted_by",
			[
				{value: "desirability.likelihood", label: "desirability"},
				{value: "registration", label: "registration date"},
				{value: "activity.last_activity", label: "last activity"},
				{value: "activity.reverted", label: "reverted edits"},
				{value: "activity.counts.all", label: "total edits"}
			]
		)
		this.node.append(this.sorted_by.node)
		
		this.node.append(":")
		
		this.direction = new UI.RadioField(
			"direction",
			[
				ui.RadioField.Radio(
					LANGUAGE.filter_menu.filters.ascending.label, "ascending",
					{tooltip: LANGUAGE.filter_menu.filters.ascending.tooltip}
				),
				ui.RadioField.Radio(
					LANGUAGE.filter_menu.filters.descending.label, "descending",
					{tooltip: LANGUAGE.filter_menu.filters.descending.tooltip}
				)
			]
		)
		this.direction.val("descending")
		this.node.append(this.direction.node)
		
		this.changed = new Event(this)
		
		this.min_edits.changed.attach(this._handle_field_change.bind(this))
		this.namespace.changed.attach(this._handle_field_change.bind(this))
		this.sorted_by.changed.attach(this._handle_field_change.bind(this))
		this.direction.changed.attach(this._handle_field_change.bind(this))
	},
	_handle_field_change: function(category){
		this.category.node.html(category.label())
	},
	_handle_category_change: function(){
		this.changed.notify()
	}
	
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
	}
})
