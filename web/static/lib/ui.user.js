UI = window.UI || {}

UI.User = Class.extend({
	init: function(id, name, registered, hasEmail, views, revisions, topics){
		this.id         = id
		this.name       = name
		this.registered = registered
		this.hasEmail   = hasEmail ? true : false
		this.views      = views || 0
		
		this.revisions  = revisions || {}
		this.topics     = topics || []
		
		this.div = $('<div>').addClass("user")
			.click(function(e){
				this.activity.select(null)
			}.bind(this))
		
		this.info      = new UI.User.Info(name)
		this.info.update(this)
		this.div.append(this.info.div)
		
		this.activity  = new UI.User.Activity(registered)
		this.activity.render(this.revisions.values())
		this.div.append(this.activity.div)
		
		this.talk      = new UI.User.Talk()
		this.talk.render(this.topics)
		this.div.append(this.talk.div)
	},
	click: function(callback){
		this.clickCallback = callback
		this.div.click(
			function(e){
				this.clickCallback(this)
			}.bind(this)
		)
	},
	toggle: function(callback){
		if(this.div.hasClass("expanded")){
			this.collapse()
		}else{
			this.expand()
		}
	},
	collapse: function(){
		this.div.css("height", "2em")
		this.div.removeClass("expanded")
	},
	expand: function(){
		this.div.css("height", "20em")
		this.div.addClass("expanded")
	},
	lastActivity: function(){
		return Set.max(this.revisions.values().map(function(r){return r.timestamp}))
	},
	updateInfo: function(info){
		if(this.id != info.id){
			throw "Can't update info.  User Ids do not match " + 
			"(" + this.id + " != " + info.id + ")"
		}
		this.name       = info.name
		this.registered = info.registered
		this.hasEmail   = info.hasEmail
		this.views      = info.views
		
		this.info.update(this)
		
		
	},
	updateRevision: function(revision){
		if(revisions[revision.id]){
			var oldRev = revisions[revision.id]
			if(oldRev == revision){
				//Nothing to do!
			}else{
				this.revisions[revision.id] = revision
				this.activity.render(this.revisions.values())
				this.info.update(this)
			}
		}
	},
	updateTalk: function(topics){
		if(topics == this.topics){
			//Nothing to do!
		}else{
			this.topics = topics
			this.talk.render(topics)
		}
	},
	selected: function(select, callback){
		if(select !== undefined){
			if(select){
				this.div.addClass("selected")
				this.expand(callback)
			}else{
				this.div.removeClass("selected")
				this.collapse(callback)
				this.activity.select(null)
			}
		}else{
			return this.div.hasClass("selected")
		}
	},
	top: function(){
		if(this.div.parent() != []){
			return this.div.position().top
		}
	},
	bottom: function(){
		if(this.div.parent() != []){
			return this.top() + this.height()
		}
	},
	height: function(){
		return this.div.outerHeight(true)
	}
})

UI.User.Info = Class.extend({
	init: function(name){
		this.div = $('<div>').addClass("info")
		
		this.name = $('<span>')
			.addClass("name")
			.text(name)
		this.div.append(this.name)
		
		this.meta = new UI.User.Meta()
		this.div.append(this.meta.div)
		
		this.menu = new UI.User.Menu(name)
		this.div.append(this.menu.div)
	},
	update: function(user){
		this.name.text(user.name)
		this.meta.update(
			user.registered, 
			user.hasEmail,
			user.revisions.values().length,
			user.lastActivity()
		)
	}
})
UI.User.Meta = Class.extend({
	init: function(){
		this.div = $('<div>').addClass("meta")
		
		this.div.append($('<dt>').text("Registered"))
		this.registered = $('<dd>')
		this.div.append(this.registered)
			
		this.div.append($('<dt>').text("Has email"))
		this.hasEmail = $('<dd>')
		this.div.append(this.hasEmail)
			
		this.div.append($('<dt>').text("Revisions"))
		this.revisions = $('<dd>')
		this.div.append(this.revisions)
			
		this.div.append($('<dt>').text("Last Activity"))
		this.lastActivity = $('<dd>')
		this.div.append(this.lastActivity)
	},
	update: function(registered, hasEmail, revisions, lastActivity){
		this.registered.text(new Date(registered*1000).format("wikiDate"))
		
		this.hasEmail.text(hasEmail ? "yes" : "no")
		
		this.revisions.text(revisions)
			
		this.lastActivity.text(new Date(lastActivity*1000).format("wikiDate"))
	}
	
})

UI.User.Menu = Class.extend({
	init: function(name){
		this.name = name
		
		this.div = $('<div>').addClass("menu")
		
		var items = $('<ul>')
		this.div.append(items)
		
		this.talk = $("<li>")
			.addClass("talk")
			.text("talk")
			.click(this.sendMessage.bind(this))
		items.append(this.talk)
		
		this.contribs = $("<li>")
			.addClass("contribs")
			.text("contribs")
			.click(this.viewContribs.bind(this))
		items.append(this.contribs)
		
		this.love = $("<li>")
			.addClass("love")
			.text("love")
			.click(this.sendLove.bind(this))
		items.append(this.love)
	},
	sendMessage: function(){
		console.log("Talk link clicked")
	},
	viewContribs: function(){
		window.open("http://enwp.org/Special:Contributions/" + this.name, "_blank")
	},
	sendMessage: function(){
		window.open("http://enwp.org/User_talk:" + this.name, "_blank")
	},
	sendLove: function(){
		window.open("http://enwp.org/User:" + this.name, "_blank")
	}
})

UI.User.Activity = Class.extend({
	init: function(origin){
		this.origin = origin
		
		this.div = $('<div>').addClass("activity")
		
		this.label = {
			y: $('<div>').addClass("label").addClass("y"),
			x: $('<div>').addClass("label").addClass("x")
		}
		this.div.append(this.label.y)
		this.days = $('<div>').addClass("days")
		this.div.append(this.days)
		
		this.breaks = {
			x: $('<div>')
				.addClass("breaks")
				.addClass("x")
				.append($('<div>').text(5))
				.append($('<div>').text(10))
				.append($('<div>').text(15))
				.append($('<div>').text(20))
				.append($('<div>').text(25))
		}
		this.div.append(this.breaks.x)
		this.div.append(this.label.x)
		
		this.selected = null
		
		this.cursor = {}
	},
	select: function(coords){
		if(this.selected){
			this.selected.selected(false)
			this.selected = null
		}
		if(coords){
			//Select the closest revision to the coords
			var column = this.grid[
				Math.max(
					0, 
					Math.min(
						this.grid.length-1, 
						coords.x
					)
				)
			]
			
			var revision = column[
				Math.max(
					0, 
					Math.min(
						column.length-1, 
						coords.y
					)
				)
			]
			
			this.selected = revision
			this.selected.selected(true)
		}else{
			this.cursor = {}
		}
	},
	shift: function(diff){
		if(this.cursor.x === undefined){
			this.cursor.x = 0
			this.cursor.y = 0
		}else{
		
			if(diff.x != 0){
				//Move on the x, but not below zero, past the last revision or into a column with no revs
				var x = this.cursor.x
				for(var i=this.cursor.x+diff.x;i<this.grid.length && i>=0;i=i+diff.x){
					if(this.grid[i].length > 0){
						x = i
						break
					}
				}
				this.cursor.x = Math.max(
					0, 
					Math.min(
						this.grid.length-1, 
						x
					)
				) 
			}
			if(diff.y != 0){
				//Move on the y, but not below zero or past the last revision in the stack
				this.cursor.y = Math.max(
					0, 
					Math.min(
						this.grid[this.cursor.x].length-1, 
						this.cursor.y + diff.y
					)
				)
			}
		}
		
		this.select(this.cursor)
	},
	render: function(revisions){
		//clear plotting space
		this.days.children().remove()
		
		//Figure out how many days we are plotting
		var days = Math.min(
			Math.floor(((new Date().getTime()/1000) - this.origin)/Constants.DAY),
			29
		)
		
		//Set up the in-memory grid
		this.grid = new Array(days+1)
	
		//Group revisions into days
		var dayRevisions = Set.group(revisions, function(r){return Math.floor((r.timestamp - this.origin)/Constants.DAY)}.bind(this))
		
		//Find maximum number of day revisions
		var maxRevs = Set.max(dayRevisions.values().map(function(revs){return revs.length}))
		
		//Render days
		for(var d=0;d<=days;d++){
			//Create tag for day
			var day = $('<div>').addClass("day")
			this.days.append(day)
			
			
			this.grid[d] = []
			
			if(dayRevisions[String(d)]){
				var revisions = dayRevisions[String(d)]
				
				//Set the height of the revs container
				var revs = $('<div>')
					.addClass('revs')
					.css('height', (revisions.length/maxRevs)*100 + "%")
				day.append(revs)
				
				//Reverse sort for more intuitive layout
				revisions.sort(function(a,b){return b.timestamp-a.timestamp})
				
				
				//Plot the revisions 
				for(var i in revisions){
					i = parseInt(i)
					var revision = revisions[i]
					var rev = new UI.User.Activity.Revision(
						revision.id, 
						revision.comment,
						revision.page, 
						revision.revert,
						(1/revisions.length)*100,
						{x:d,y:i}
					).click(function(rev){
						this.cursor = rev.coords
						this.select(this.cursor)
					}.bind(this))
					this.grid[d].push(rev)
					revs.prepend(rev.div)
				}
			}
		}
	}
})

UI.User.Activity.Revision = Class.extend({
	init: function(id, comment, page, revert, height, coords){
		this.coords = coords
		this.div = $('<div>')
			.addClass("rev")
			.css("height", height + "%")
			.addClass("ns_" + page.namespace)
			.attr('title', "Edit to " + Page.fullTitle(page.namespace, page.title) + ": " + comment)
		
		if(revert){
			this.div.addClass("reverted")
		}
	},
	click: function(callback){
		this.clickCallback = callback
		this.div.click(
			function(e){
				this.clickCallback(this)
				e.stopPropagation()
			}.bind(this)
		)
		return this
	},
	selected: function(select){
		if(select == undefined){
			return this.div.hasClass("selected")
		}else{
			if(select){
				this.div.addClass("selected")
			}else{
				this.div.removeClass("selected")
			}
		}
	}
})

UI.User.Activity.Detail = Class.extend({
	init: function(){
		this.div = $('<div>')
			.addClass("detail")
		
		this.title = $('<a>')
			.addClass("title")
			.attr('target', "_blank")
		this.div.append(this.title)
		
		this.diff = new UI.User.Activity.Diff()
		this.div.append(this.diff.div)
		
		this.comment = $('<div>')
			.addClass("comment")
		this.div.append(this.comment)
		
		this.revert = new UI.User.Activity.Revert()
		this.div.append(this.revert.div)
		
		this.loadingId = null
	},
	load: function(id, page, comment, revert){
		
		this.title.text(Page.fullTitle(page.namespace, page.title))
			.attr('href', CONSTANTS.WIKI + "/wiki/" + Page.fullTitle(page.namespace, page.title))
		
		this.comment.text(comment)
		
		this.diff.loading(true)
		this.loadingId = id
		API.diff(
			id,
			function(id, rows){
				if(id == this.loadingId){
					this.diff.loading(false)
					this.diff.load(rows)
				}
			}.bind(this),
			function(message){
				this.diff.loading(false)
				this.diff.load("Failed to load diff: " + message)
			}.bind(this)
		)
		
		if(revert){
			this.revert.load(revert.id, revert.user, revert.comment)
			this.revert.show()
		}else{
			this.revert.clear()
			this.revert.hide()
		}
	}
})

UI.User.Activity.Diff = Class.extend({
	init: function(){
		this.table = $('<table>')
			.addClass("diff")
	},
	loading: function(loading){
		if(loading){
			this.table.addClass("loading")
		}else{
			this.table.removeClass("loading")
		}
	},
	clear: function(){
		this.table.children().remove()
	},
	load: function(rows){
		this.table.append(rows)
	}
})

UI.User.Activity.Revert = Class.extend({
	init: function(){
		this.div = $('<div>')
			.addClass("revert")
		
		this.header = {
			div: $('<div>')
				.addClass("header"),
			reverted: $('<a>')
				.addClass("reverted")
				.attr('target', "_blank")
				.text("Reverted"),
			user: $('<a>')
				.addClass("user")
				.attr('target', "_blank")
		}
		this.header.div.append(this.header.reverted)
		this.header.append(" by ")
		this.header.div.append(this.header.user)
		this.div.append(this.header.div)
		
		this.comment = $('<div>')
			.addClass("comment")
		this.div.append(this.comment)
	},
	visible: function(visible){
		if(visible){
			this.div.show()
		}else{
			this.div.hide()
		}
	},
	load: function(id, user, comment){
		this.header.reverted.attr('href', CONSTANTS.WIKI + "/wiki/?oldid=" + id)
		this.header.user.text(user.name).attr('href', CONSTANTS.WIKI + "/wiki/User:" + user.name)
		this.comment.text(comment)
	}
})
	
UI.User.Talk = Class.extend({
	init: function(){
		this.div = $('<div>').addClass("talk")
		
		this.topics = $('<div>').addClass("topics")
		this.div.append(this.topics)
	},
	render: function(topics){
		//clear space for new topics
		this.topics.children().remove()
		
		//For each topic, added it. 
		for(var i in topics){var t = topics[i]
			var topic = $('<div>')
				.addClass("topic")
				.click(function(e){
					alert("This will eventually show you a preview of the discussion topic.")
					e.stopPropagation()	
				})
			
			this.topics.append(topic)
				
			if(t.class){
				topic.addClass(t.class)
			}
			
			icon = $('<dt>')
				.attr('title', $("<div>" + t.title + "</div>").text().substr(0, 25) + "...")
			topic.append(icon)
			
			title = $('<dd>')
				.html(t.title)
			topic.append(title)
		}
	}
})

