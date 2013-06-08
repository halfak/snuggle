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
		this.node.append(this.header.node)
		
		this.filters = new ui.EventFilters()
		this.filters.changed.attach(this._handle_filters_change.bind(this))
		this.node.append(this.filters.node)
		
		this.event_list = new ui.EventList()
		this.node.append(this.event_list.node)
		
		this.loaded = false
	},
	_handle_filters_change: function(){
		if(this.filters_change_delay){
			clearTimeout(this.filters_change_delay)
		}
		this.filters_change_delay = setTimeout(
			this._update_cursor.bind(this),
			env.delays.update_cursor
		)
	},
	load: function(){
		if(!this.loaded){
			logger.info("ui.event_browser: loading...")
			this._update_cursor()
			this.loaded = true
		}
	},
	_update_cursor: function(){
		logger.debug("ui.event_browser: updating cursor...")
		var cursor = servers.local.events.cursor(this.filters.val())
		this.event_list.load(cursor)
	}
})
