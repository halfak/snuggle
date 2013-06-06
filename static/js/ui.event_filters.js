ui = window.ui || {}

ui.EventFilters = Class.extend({
	init: function(){
		this.node = $("<div>")
			.addClass("event_filters")
		this.type = new ui.SelectField(
			"type",
			[
				{label: i18n.get("all"), value: "all"},
				{label: i18n.get("categorizations"), value: "categorizer user"},
				{label: i18n.get("user actions"), value: "user action"}
			],
			{
				class: "type",
				tooltip: i18n.get("select a type of event to filter the list")
			}
		)
		this.type.changed.attach(this._handle_field_change.bind(this))
		this.node.append(this.type.node)
		
		this.node.append(" <span>" + i18n.get("types of events by") + "<span> ")
		
		this.snuggler_name = new ui.TextField(
			"snuggler_name",
			{
				class: "snuggler_name",
				tooltip: i18n.get("type the name of a snuggle user here to filter the list")
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
		if(value === undefined){
			return {
				type: this.type.val(),
				snuggler_name: this.snuggler_name.val()
			}
		}else{
			this.type.val(values.type)
			this.snuggler_name.val(values.snuggle_name)
		}
	}
})
