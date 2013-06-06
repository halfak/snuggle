ui = window.ui || {}

ui.EventBrowser = Class.extend({
	init: function(){
		this.node = $("<div>")
			.addClass("event_browser")
		
		this.header = {
			node: $("<div>")
				.addClass("header")
				.html(i18n.get("Recent activity"))
		}
		this.node.append(this.header)
		
		
		this.filters = new ui.EventFilters()
		this.filters.changed.attach(this._handle_filters_change.bind(this))
		this.node.append(this.filters.node)
		
		this.event_list = new ui.EventList()
		this.node.append(this.event_list.node)
	},
	_handle_filters_change: function(){
		if(this.filters_change_delay){
			clearTimeout(this.filters_change_delay)
		}
		this.filters_change_delay = setTimeout(
			this._update_query.bind(this),
			delays.update_event_filters
		)
	},
	_update_query: function(){
		logger.debug("ui.recent_events: updating query")
		var query = servers.local.events.query(this.filters.val())
		this.user_list.load(query)
	}
})
