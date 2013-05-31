ui = window.ui || {}


ui.RevisionDetails = Class.extend({
	init: function(){
		this.node = $("<div>")
			.addClass("revision_details")
			.hide()
			.click(function(e){e.stopPropagation()})
		
		this.pointer = new ui.RevisionDetails.Pointer()
		this.node.append(this.pointer.node)
		
		this.body = {
			node: $('<div>')
				.addClass("body")
		}
		this.node.append(this.body.node)
		
		this.title = {
			node: $('<a>')
				.addClass("title")
				.attr('target', "_blank")
		}
		this.body.node.append(this.title.node)
		
		this.revision = new ui.RevisionDetails.Revision()
		this.body.node.append(this.revision.node)
		
		this.revert = new ui.RevisionDetails.Revert()
		this.body.node.append(this.revert.node)
		
		this.diff = new ui.RevisionDetails.Diff()
		this.body.node.append(this.diff.node)
		
		this.loadingId = null
		this.hide()
	},
	show: function(){
		this.node.show()
	},
	hide: function(){
		this.node.hide()
	},
	load_revision: function(revision, day){
		if(revision){
			this._position(revision, day)
			
			var page_name = util.page_name(revision.page().namespace, revision.page().title).replace(/_/g, " ")
			this.title.node.text(page_name)
			this.title.node.attr('href', util.page_link(page_name))
			
			this.revision.render(revision.id(), revision.timestamp(), revision.comment())
			
			this.revert.render(revision.revert())
			this.revert.self(revision.self_revert())
			
			this.diff.set_height(this.node.innerHeight() - this.diff.top())
			
			//
			//  This is probably wrong.
			//
			//
			this.diff.loading(true)
			this.loadingId = revision.id()
			servers.mediawiki.revisions.diff(
				revision.id(),
				function(id, diff){
					if(diff){
						if(id == this.loadingId){
							this.diff.loading(false)
							this.diff.diff(diff)
							this.show()
						}
					}else{
						SYSTEM.mediawiki.revisions.markup(
							id,
							function(id, markup){
								this.diff.loading(false)
								this.diff.create(markup)
								this.show()
							}.bind(this),
							function(message){
								this.diff.loading(false)
								this.diff.error("Failed to load diff: " + message)
								this.show()
							}.bind(this)
						)
					}
				}.bind(this),
				function(message){
					this.diff.loading(false)
					this.diff.error("Failed to load diff: " + message)
				}.bind(this)
			)
		}else{
			this.hide()
		}
	},
	_position: function(revision, day){
		if(revision){
			//Figure out if we want to show the details on the right or the left
			
			if(day < 15){//show on the right
				this.node.css("right", '')
				this.node.css("left", revision.right() + this.node.parent().innerWidth()/15)
				this.node.addClass("right")
				this.node.removeClass("left")
			}else{//show on the left
				this.node.css("left", '')
				this.node.css("right", this.node.parent().innerWidth() - revision.left() + this.node.parent().innerWidth()/15)
				this.node.addClass("left")
				this.node.removeClass("right")
			}
			this.show() //This needs to happen between positioning the main box and the pointer.
			this.pointer.point(revision.middle())
		}
	}
})
/**
Displays and adjusts the direction and location of the pointer.
*/
ui.RevisionDetails.Pointer = Class.extend({
	init: function(){
		this.node = $("<div>")
			.addClass("pointer")
		
	},
	point: function(height){
		this.node.css("top", height - (this.height()/2) - 7)
	},
	height: function(){
		return this.node.outerHeight(true)
	}
})


/**
Displays the metadata about a revision.
*/
ui.RevisionDetails.Revision = Class.extend({
	init: function(){
		this.node = $("<div>")
			.addClass("revision")
		
		this.timestamp = {
			node: $('<a>')
				.addClass("timestamp")
				.attr('target', "_blank")
		}
		this.node.append(this.timestamp.node)
		
		this.comment = {
			node: $("<span>")
				.addClass("comment")
		}
		this.node.append(this.comment.node)
	},
	
	/**
	Renders metadata
	
	:Parameters:
		id : int
			the revision identifier
		timestamp : `Date`
			the timestamp at which the revision was saved
		comment : string
			the edit summary left for the revision
	*/
	render: function(id, timestamp, comment){
		this.timestamp.node.text(timestamp.format('wikiDate'))
		this.timestamp.node.attr('href', util.rev_diff_link(id))
		
		this.comment.node.html(util.linkify(comment || ""))
	}
})

/**
Displays the details of a reverting revision.
*/
ui.RevisionDetails.Revert = Class.extend({
	
	init: function(){
		this.node = $("<div>")
			.addClass("revert")
			.hide()
		
		this.preamble = {
			node: $("<span>")
				.addClass("preamble")
		}
		this.node.append(this.preamble.node)
		
		this.reverted = {
			node: $("<a>")
				.addClass('reverted')
				.attr('target', "_blank")
				.text("Reverted")
		}
		this.preamble.node.append(this.reverted.node)
		this.preamble.node.append(" by ")
		
		this.user = {
			node: $("<a>")
				.addClass('user')
				.attr('target', "_blank")
		}
		this.preamble.node.append(this.user.node)
		
		this.comment = {
			node: $("<span>")
				.addClass("comment")
		}
		this.node.append(this.comment.node)
	},
	
	/**
	Shows the widget
	*/
	hide: function(){
		this.node.hide()
	},
	
	/**
	Hides the widget
	*/
	show: function(){
		this.node.show()
	},
	
	self: function(self_revert){
		if(self_revert){
			this.node.addClass("self")
		}else{
			this.node.removeClass("self")
		}
	},
	
	/**
	Renders a revert if one is passed.  If undefined or null are passed, the
	revert widget is hidden.
	
	:Parameters:
		revert : obj
			the object mapping of data related to a revert.  E.g. {id: <int>, user: {id: <int>, name: <string>, ...}, ...}
	*/
	render: function(revert){
		if(revert){
			this.reverted.node.attr('href', util.rev_diff_link(revert._id))
			this.user.node.text(revert.user.name)
			this.user.node.attr('href', util.user_link(revert.user.name))
			
			this.comment.node.text(revert.comment || "")
			this.show()
		}else{
			this.hide()	
		}
	}
})

/**
Displays a revision diff or error message decribing why a diff could not be 
displayed
*/
ui.RevisionDetails.Diff = Class.extend({
	init: function(){
		this.node = $('<div>')
			.addClass("diff")
	},
	
	/**
	Sets the status to loading or remove the status depending on the valence
	of `loading`.
	
	:Parmeters:
		loading: true | false
			should the status be set to loading?
	*/
	loading: function(loading){
		if(loading){
			this.node.addClass("loading")
		}else{
			this.node.removeClass("loading")
		}
	},
	top: function(){
		return this.node.position().top
	},
	
	/**
	Clears the contents.
	*/
	clear: function(){
		this.node.children().remove()
	},
	
	/**
	*/
	set_height: function(height){
		logger.debug("revision_detail.diff setting height to " + height)
		this.node.css('height', height)
	},
	
	/**
	Parses and displays a diff
	
	:Parameters:
		diff : string
			MediaWiki diff (table & rows) in string format
	*/
	diff: function(diff){
		this.clear()
		ops = WikiDiff.parse($("<table>" + diff + "</table>"))
		for(var i=0; i<ops.length; i++){var op = ops[i]
			if(op.op == "change"){
				var change = $('<div>')
					.addClass(op.op)
				
				for(var j in op.ops){
					change.append(
						$('<span>')
						.addClass(op.ops[j].op)
						.text(op.ops[j].content)
					)
				}
				this.node.append(change)
			}else if(op.op == "lineno"){
				var line = $('<div>')
					.addClass(op.op)
					.text(op.line)
				this.node.append(line)
			}else if(op.op == "context"){
				var context = $('<div>')
					.addClass("context")
				
				var next = ops[i+1]
				if(next !== undefined){
					if(next.op == "change" || next.op == "added_line" || next.op == "removed_line"){
						context.html(op.content)
						context.addClass("content")
					}
				}
				
				var last = ops[i-1]
				if(last !== undefined){
					if(last.op == "change" || last.op == "added_line" || last.op == "removed_line"){
						context.html(op.content)
						context.addClass("content")
					}
				}
				this.node.append(context)
			}else{
				var operation = $('<div>')
					.addClass(op.op)
				
				this.node.append(operation)
			}
		}
	},
	
	/**
	Displays a page creation.
	
	:Parameters:
		markup : string
			the markup that the page was created with
	*/
	create: function(markup){
		this.clear()
		var create = $('<div>')
			.addClass("change")
			.append($('<span>').addClass('add').text(markup))
			
		this.node.append(create)
	},
	
	/**
	Displays an error
	
	:Parameters:
		message : string
			an error message to display
	*/
	error: function(message){
		this.clear()
		var error = $('<div>')
			.addClass("error")
			.text(message)
		
		this.node.append(error)
	}
})

/**
Represents a grid of revisions broken up into days.  This class provides
a mechanism for displaying the revisions in a bar chart format.  A user cursor
and current selection is also maintained and can be shifted through the chart. 
*/
ui.DayGrid = Class.extend({
	/**
	:Parameters:
		origin : `Date`
			the data at which revision timestamps can be compared to 
			determine the day in which they happened.  This is 
			usually a user's registration date.
		max_days : int
			the maximum number of days to be displayed in the plot.  
			Revisions that fall outside of this many days will be 
			ignored.
	*/
	init: function(origin, max_days){
		this.origin = origin
		this.max_days = max_days || 30
		this.max_revisions = 0 //No revisions inserted yet.
		
		this.node = $("<div>")
			.addClass("day_grid")
		
		this.cursor = null
		
		this.selection = null
		
		this.days = []
		this._ensure_days(Math.min(this.max_days, Math.floor((new Date() - this.origin)/miliseconds.DAY)))
		
		this.revision_selected = new Event(this)
		
	},
	_handle_revision_clicked: function(day, index, revision){
		this.set_cursor(day.day, index)
	},
	
	/**
	Sets or gets the "enabled" status of the grid.  If `enabled` is provided,
	the status will be set to Boolean(enabled).  If it is not provided, the 
	current status will be returned. 
	
	:Parameters:
		enabled : `Boolean`
			enable status to set.
	*/
	enabled: function(enabled){
		if(enabled === undefined){
			return this.node.hasClass("enabled")
		}else{
			if(enabled){
				this.node.addClass("enabled")
			}else{
				this.node.removeClass("enabled")
				this.clear_cursor()
			}
		}
	},
	
	/**
	Inserts a single revision into the grid.  The grid is automatically 
	re-normalized after the insertion.
	
	:Parameter:
		revision : `ui.DayGrid.Revision`
			the revision to insert
	*/
	insert: function(revision){
		this._insert(revision)
		this._normalize()
	},
	
	/**
	Efficiently loads a set of revisions.  This function is effectively the 
	same as insert(), but it handles the insertion of many revisions 
	efficiently.
	
	:Parameters:
		revisions : [ui.DayGrid.Revision]
			a list of revisions to insert
	*/
	load: function(revisions){
		for(var i=0;i<revisions.length;i++){
			this._insert(revisions[i])
		}
		if(revisions.length > 0){
			this._normalize()
		}
	},
	
	/**
	Updates the selection to be as close as possible to the cursor.
	*/
	set_cursor: function(day, index){
		this.cursor = {
			day: day,
			index: index
		}
		
		//Make sure that day is within bounds
		day = Math.max(
			0,
			Math.min(
				this.days.length-1,
				day
			)
		)
		
		//Get the closes possible index.
		if(!this.days[day].get(index)){
			if(this.days[day].length() != 0){
				index = this.days[day].length() - 1
			}else{
				index = null
			}
		}
		
		this._update_selection(this.days[day].get(index), day, index)
	},
	/**
	Shifts a cursor by a day and index delta.
	
	:Parameters:
		day_delta : int
			positive values increase the cursor's day, negative values decrease it
		index_delta : int
			positive values increase the cursor's index, negative values decrease it
	*/
	shift_cursor: function(day_delta, index_delta){
		day_delta   = day_delta || 0
		index_delta = index_delta || 0
		
		if(!this.cursor){
			this.set_cursor(0, 0)
		}else{
			var day = this.cursor.day || 0
			var index = this.cursor.index || 0
			
			if(day_delta != 0){
				//Move on the x, but not below zero, past the last revision or into a column with no revs
				for(var i = this.cursor.day + day_delta;i<this.days.length && i >= 0;i=i+day_delta){
					if(this.days[i] && this.days[i].length() > 0){
						//Found a day with some stuff
						//day = day
						day = i
						break
					}
				}
			}
			if(index_delta != 0){
				//Move on the y, but not below zero or past the last revision in the stack
				index = Math.max(
					0, 
					Math.min(
						this.days[this.cursor.day].length()-1, 
						this.cursor.index + index_delta
					)
				)
			}
			this.set_cursor(day, index)
		}
	},
	/**
	Clears the user's cursor position. 
	*/
	clear_cursor: function(){
		this.cursor = null
		
		this._update_selection(null, null, null)
	},
	
	_ensure_days: function(days){
		days = Math.min(this.max_days, days)
		for(var i=this.days.length;i<days;i++){
			var day = new ui.DayGrid.Day(this.days.length)
			day.revision_clicked.attach(this._handle_revision_clicked.bind(this))
			this.days.push(day)
			this.node.append(day.node)
		}
	},
	_insert: function(revision){
		var rev_day = Math.floor((revision.timestamp() - this.origin)/miliseconds.DAY)
		if(rev_day < this.max_days){
			this._ensure_days(rev_day+1)
			revision.set_grid(this) //This is a bit of a hack. :\
			this.days[rev_day].insert(revision)
		}else{
			//ignore!  Do nothing.  Plug your ears and hum.  Lalalalala
		}
	},
	_normalize: function(){
		var current_max = this.days.map(function(d){return d.length()}).max() //Check if we are newly too tall
		if(current_max != this.max_revisions){ //We are!
			for(var i=0;i<this.days.length;i++){
				var day = this.days[i]
				day.proportion(day.length()/current_max) //Normalize to the right proportion
			}
		}
		this.max_revisions = current_max //Remember what we did here
	},
	_update_selection: function(revision, day, index){
		if(this.selection != revision){
			logger.debug("revision_graph.grid updating selection")
			if(this.selection){
				this.selection.selected(false)
			}
			
			this.selection = revision
			this.revision_selected.notify(revision, day, index)
			
			if(this.selection){
				this.selection.selected(true)
			}
		}
	}
})

/**
Represents a column in `ui.DayGrid`.
*/
ui.DayGrid.Day = Class.extend({
	/**
	:Parameters:
		day : int
			what day am I?
	*/
	init: function(day){
		this.day = day
		
		this.node = $("<div>")
			.addClass("day")
			
		this.container = {
			node: $("<div>")
				.addClass("container")
		}
		this.node.append(this.container.node)
		
		this.revision_clicked = new Event(this)
		
		this.list = []
	},
	_handle_revision_clicked: function(revision){
		var index = this.list.indexOf(revision)
		logger.debug("day revision clicked at index " + index)
		this.revision_clicked.notify(index, revision)
	},
	/**
	Sets the height of the bar by the proportion of space that it should 
	occupy.
	
	:Parameters:
		proportion : float
			the proportion height to set
	*/
	proportion: function(proportion){
		this.container.node.css("height", proportion*100 + "%")
	},
	/**
	Returns the number of revisions that have been inserted into this day.
	*/
	length: function(){
		return this.list.length
	},
	/**
	Inserts a new revision and automatically renormalizes the day's height.
	
	:Parameters:
		revision : `ui.DayGrid.Revision`
			the revision to insert
	*/
	insert: function(revision){
		this._insert(revision)
		this._normalize()
	},
	/**
	Gets the revision at a particular index.  This function returns null if
	there is no revision @ index.
	
	:Parameters:
		index : int
			the index to get
	*/
	get: function(index){
		return this.list[index]
	},
	_insert: function(revision){
		revision.clicked.attach(this._handle_revision_clicked.bind(this))
		
		for(var i=0;i<this.list.length;i++){
			var current = this.list[i]
			if(current.timestamp() > revision.timestamp()){
				this.list.splice(i, 0, revision)
				revision.node.insertAfter(current.node)
				return
			}
		}
		this.list.push(revision)
		this.container.node.prepend(revision.node)
	},
	_normalize: function(){
		var proportion = 1/this.list.length
		
		for(var i=0;i<this.list.length;i++){
			var revision = this.list[i]
			revision.proportion(proportion)
		}
	}
})

/**
Represents a revision block that can be selected.
*/
ui.DayGrid.Revision = Class.extend({
	init: function(instance){
		this.node = $("<div>")
			.addClass("revision")
			.click(this._handle_click.bind(this))
		
		
		this.clicked = new Event(instance || this)
	},
	_handle_click: function(e){
		if(this.grid.enabled()){
			logger.debug("day_grid.revision handling click")
			this.clicked.notify()
			util.stop_propagation(e)
		}
	},
	id: function(){throw "Must be implemented by subclass"},
	timestamp: function(){throw "Must be implemented by subclass"},
	comment: function(){throw "Must be implemented by subclass"},
	revert: function(){throw "Must be implemented by subclass"},
	proportion: function(proportion){
		this.node.css("height", proportion*100 + "%")
	},
	set_grid: function(grid){
		this.grid = grid
	},
	selected: function(selected){
		if(selected === undefined){
			return this.hasClass("selected")
		}else{
			selected = Boolean(selected)
			if(selected){
				this.node.addClass("selected")
			}else{
				this.node.removeClass("selected")
			}
		}
	},
	top: function(){
		return (
			this.node.position().top + 
			this.node.parent().position().top + //ui.DayGrid.Day.container.node.position().top
			this.node.parent().parent().position().top//ui.DayGrid.Day.node.position().top
		)
	},
	left: function(){
		return (
			this.node.position().left + //Should be zero 
			this.node.parent().position().left + //ui.DayGrid.Day.container.node.position().left -- should be zero
			this.node.parent().parent().position().left //ui.DayGrid.Day.node.position().left -- the real value we want
		)
	},
	right: function(){
		return this.left() + this.width()
	},
	height: function(){
		return this.node.outerHeight(true)
	},
	width: function(){
		return this.node.outerWidth(true)
	},
	middle: function(){
		return this.top() + (this.height()/2)
	}
})

ui.RevisionGraph = Class.extend({
	init: function(origin){
		this.node = $("<div>")
			.addClass("revision_graph")
			.click(this._handle_click.bind(this))
		
		//Labels
		this.label = {
			y: {
				node: $('<div>')
					.addClass("label")
					.addClass("y")
					.text("edits")
			},
			x: {
				node: $('<div>')
					.addClass("label")
					.addClass("x")
					.text("days since registration")
			}
		}
		this.node.append(this.label.y.node)
		
		//Grid
		this.grid = new ui.DayGrid(origin)
		this.grid.revision_selected.attach(this._handle_revision_selection.bind(this))
		this.node.append(this.grid.node)
		
		//Breaks
		this.breaks = {
			x: {
				node: $('<div>')
					.addClass("breaks")
					.addClass("x")
					.append($('<div>').text(5))
					.append($('<div>').text(10))
					.append($('<div>').text(15))
					.append($('<div>').text(20))
					.append($('<div>').text(25))
			}
		}
		this.node.append(this.breaks.x.node)
		this.node.append(this.label.x.node)
		
		//Details
		this.details = new ui.RevisionDetails()
		this.details.hide()
		this.node.append(this.details.node)
		
	},
	_handle_click: function(e){
		logger.debug("revision_graph handling click.")
		this.grid.clear_cursor()
	},
	_handle_revision_selection: function(_, revision, day, index){
		this.details.load_revision(revision, day)
	},
	expanded: function(expanded){
		if(expanded === undefined){
			return this.node.hasClass("expanded")
		}else{
			if(expanded){
				this.node.addClass("expanded")
				this.grid.enabled(true)
			}else{
				this.node.removeClass("expanded")
				this.grid.enabled(false)
				this.details.hide()
			}
		}
	}
})
