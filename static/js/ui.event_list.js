ui.EventList = Class.extend({
	init: function(model, view){
		this.model = model || new ui.EventList.Model()
		this.view  = view || new ui.EventList.View(this.model)
		
		this.view.view_changed.attach(this._handle_view_change.bind(this))
		
		this.node = this.view.node
		
		this.query = null
	},
	_handle_view_change: function(){
		this._read_until_full()
	},
	_read_until_full: function(){
		// This function checks to see if we should load more events
		view = this.view.view()
		
		if(view.end - view.bottom < 200 && !this.model.loading()){
			logger.debug("ui.event_list: time to load more results!")
			this._load_more()
		}
	},
	load: function(query){
		this.query = query
		this.model.clear()
		this._read_until_full()
	},
	_load_more: function(){
		if(!this.query.complete && !this.view.loading()){
			logger.debug("ui.event_list: sending a request for more events.")
			this.view.loading(true)
			this.query.next(
				10,
				function(query, docs){
					this.view.loading(false)
					if(query == this.query){ //If we are still running the same query
						for(var i=0;i<docs.length;i++){
							this.append(new ui.Event.from_doc(docs[i]))
						}
					}
					this._read_until_full() //Continue reading if necessary
				}.bind(this),
				function(message){
					this.view.loading(false)
					message = "ui.event_list: an error occurred while trying " + 
						"to load more events: " + message
					logger.error(message)
					alert(message)
				}.bind(this)
			)
		}
	}
})
ui.EventList.Model = Class.extend({
	init: function(){
		this.list = []
		
		this.appended          = new Event(this)
		this.cleared           = new Event(this)
	},
	append: function(event){
		this.list.push(event)
		this.appended.notify(event)
	},
	clear: function(){
		this.list = []
		this.cleared.notify(event)
	}
})
ui.EventList.View = Class.extend({
	init: function(model){
		this.model = model
		this.model.appended.attach(this._handle_append.bind(this))
		this.model.cleared.attach(this._handle_clear.bind(this))
		
		this.node = $("<div>")
			.addClass("event_list")
			.scroll(this._handle_scroll.bind(this))
		
		$(window).resize(this._handle_window_resize.bind(this))
		
		this.view_changed = new Event(this)
		
	},
	_handle_append: function(event){
		this.node.append(this.event.node)
	},
	_handle_clear: function(){
		this.node.children.detach()
		this.loading(false)
	},
	_handle_scroll: function(){
		this.view_changed.notify()
	},
	_handle_window_resize: function(){
		this.view_changed.notify()
	},
	view: function(){
		return {
			top: this.node.scrollTop(),
			bottom: this.node.scrollTop()+this.node.height(),
			end: this.node[0].scrollHeight
		}
	},
	loading: function(loading){
		if(loading === undefined){
			return this.node.hasClass("loading")
		}else{
			if(loading){
				this.node.addClass("loading")
			}else{
				this.node.removeClass("loading")
			}
		}
	}
})
