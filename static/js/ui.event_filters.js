ui = window.ui || {}

ui.EventFilters = Class.extend({
	init: function(){
		this.node = $("<div>")
			.addClass("event_filters")
		
		this.types = new ui.SelectField(
			"types",
			[
				{label: i18n.get("all events"), value: []},
				{
					label: i18n.get("categorizations"), 
					value: [{entity: "user", action: "categorized"}]
				},
				{
					label: i18n.get("user actions"), 
					value: [{entity: "user", action: "actioned"}]
				},
				{
					label: i18n.get("system events"), 
					value: [
						{entity: "system", action: "started"},
						{entity: "system", action: "stopped"}
					]
				}
			],
			{
				class: "type",
				tooltip: i18n.get("select a type of event to filter the list"),
				tabindex: env.tabindex.event_filters
			}
		)
		this.types.changed.attach(this._handle_field_change.bind(this))
		this.node.append(this.types.node)
		
		this.node.append(" <span>" + i18n.get("by user") + "<span> ")
		
		this.snuggler_name = new ui.TextField(
			"snuggler_name",
			{
				class: "snuggler_name",
				tooltip: i18n.get("type the name of a snuggle user here to filter the list"),
				tabindex: env.tabindex.event_filters
			}
		)
		this.snuggler_name.changed.attach(this._handle_field_change.bind(this))
		this.node.append(this.snuggler_name.node)
		
		this.changed = new Event(this)
	},
	_handle_field_change: function(){
		this.changed.notify()
	},
	val: function(values){
		if(values === undefined){
			return {
				types: this.types.val(),
				snuggler_name: this.snuggler_name.val()
			}
		}else{
			this.types.val(values.types)
			this.snuggler_name.val(values.snuggle_name)
		}
	}
})
