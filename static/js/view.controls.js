View = window.View || {}

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
				{value: null, label: "uncategorized", o: {class: "unsorted"}},
				{value: "good-faith", o: {class: "good-faith"}},
				{value: "ambiguous", o: {class: "ambiguous"}},
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
				{value: "last_activity", label: "last activity"},
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
