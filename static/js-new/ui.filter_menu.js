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
				new ui.RadioField.Radio(
					i18n.get("uncategorized"), null, 
					{
						class: "uncategorized",
						tooltip: i18n.get("new users that haven't been categorized yet")
					}
				),
				new ui.RadioField.Radio(
					i18n.get("good-faith"), "good-faith", 
					{
						class: "good-faith",
						tooltip: i18n.get("new users that have been categorized as good-faith")
					}
				),
				new ui.RadioField.Radio(
					i18n.get("ambiguous"), "ambiguous", 
					{
						class: "ambiguous",
						tooltip: i18n.get("new users that have been categorized as ambiguous")
					}
				),
				new ui.RadioField.Radio(
					i18n.get("bad-faith"), "bad-faith", 
					{
						class: "bad-faith",
						tooltip: i18n.get("new users that have been categorized as bad-faith")
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
	val: function(val){
		if(!val){
			return $.extend(
				this.filters.val(),
				{category: this.categories.val()}
			)
		}else{
			this.filters.val(val)
			this.categories.val(val.category)
			
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
		category.changed.attach(this._handle_category_change.bind(this))
		
		this.node = $("<div>")
			.addClass("filters")
		
		this.category = {
			node: $("<span>")
				.addClass("category")
		}
		this.node.append(this.category.node)
		
		this.node.append(
			" " + i18n.get("newcomers with more than") + " "
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
		
		this.node.append(" " + i18n.get("edits to") + " ")
		
		this.namespace = new ui.SelectField(
			"namespace",
			[
				{value: "all", label: i18n.get("any page")},
				{value: 0,    label: configuration.mediawiki.namespaces[0].name},
				{value: 1,    label: configuration.mediawiki.namespaces[1].name},
				{value: 2,    label: configuration.mediawiki.namespaces[2].name},
				{value: 3,    label: configuration.mediawiki.namespaces[3].name},
				{value: 4,    label: configuration.mediawiki.namespaces[4].name},
				{value: 5,    label: configuration.mediawiki.namespaces[5].name},
				{value: 6,    label: configuration.mediawiki.namespaces[6].name},
				{value: 7,    label: configuration.mediawiki.namespaces[7].name},
				{value: 8,    label: configuration.mediawiki.namespaces[8].name},
				{value: 9,    label: configuration.mediawiki.namespaces[9].name},
				{value: 10,   label: configuration.mediawiki.namespaces[10].name},
				{value: 11,   label: configuration.mediawiki.namespaces[11].name},
				{value: 12,   label: configuration.mediawiki.namespaces[12].name},
				{value: 13,   label: configuration.mediawiki.namespaces[13].name},
				{value: 14,   label: configuration.mediawiki.namespaces[14].name},
				{value: 15,   label: configuration.mediawiki.namespaces[15].name}
			]
			
		)
		this.node.append(this.namespace.node)
		
		this.node.append(" " + i18n.get("sorted by") + " ")
		
		this.sorted_by = new ui.SelectField(
			"sorted_by",
			[
				{value: "desirability.likelihood", label: i18n.get("desirability")},
				{value: "registration", label: i18n.get("registration date")},
				{value: "activity.last_activity", label: i18n.get("last activity")},
				{value: "activity.reverted", label: i18n.get("reverted edits")},
				{value: "activity.counts.all", label: i18n.get("total edits")}
			]
		)
		this.node.append(this.sorted_by.node)
		
		this.node.append(":")
		
		this.direction = new ui.RadioField(
			"direction",
			[
				new ui.RadioField.Radio(
					i18n.get("ascending"), "ascending",
					{tooltip: i18n.get("sort in increasing order")}
				),
				new ui.RadioField.Radio(
					i18n.get("descending"), "descending",
					{tooltip: i18n.get("sort in descreasing order")}
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
	},
	
	/**
	Gets or sets the current value of all menu settings.
	
	:Parameters:
		val : obj
			an object mapping of all values to set
	*/
	val: function(val){
		if(!val){
			return {
				min_edits: parseInt(this.min_edits.val()),
				namespace: this.namespace.val(),
				sorted_by: this.sorted_by.val(),
				direction: this.direction.val()
			}
		}else{
			this.min_edits.val(val.min_edits)
			this.namespace.val(val.namespace)
			this.sorted_by.val(val.sorted_by)
			this.direction.val(val.direction)
		}
	}
})
