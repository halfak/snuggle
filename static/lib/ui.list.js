UI = window.UI || {}
UI.List = Class.extend({
	init: function(){
		this.div = $('<div>').attr('id', "list")
		this.users = []
		this.selected = -1
		
		this.loader = {
			//top: $('<div>').addClass("loader"),
			bottom: new UI.List.Loader()
		}
		this.body = $('<div>').addClass("body")
		//this.div.append(this.loader.top)
		this.div.append(this.body)
		this.div.append(this.loader.bottom.div)
		
		$(window).keydown(function(e){
			switch(e.which){
				case 8:
					this.previous()
					break;
				case 13:
					this.next()
					break;
				case 32:
					if(this.selected != -1){
						this.users[this.selected].toggle()
					}
			}
		}.bind(this))
	},
	prepend: function(users){
		for(var i in users){user = users[users.length-1-i]
			this.body.prepend(user.div)
			this.users.unshift(user)
			user.click(this.selectUser.bind(this))
			
			if(this.selected != -1){
				this.selected += 1
			}
		}
	},
	append: function(users){
		for(var i in users){user = users[i]
			this.body.append(user.div)
			this.users.push(user)
			user.click(this.selectUser.bind(this))
		}
	},
	selectUser: function(user){
		for(var i in this.users){var luser = this.users[i]
			if(luser.id == user.id){
				this.select(i)
				break
			}
		}
				
	},
	select: function(i){
		if(this.selected != -1){
			this.users[this.selected].selected(false)
		}
		if(i != -1){
			this.users[i].selected(true)
		}
		this.selected = i
	},
	previous: function(){
		this.select(
			Math.max(
				this.selected - 1,
				-1 + (this.users.length > 0)
			)
		)
	},
	next: function(){
		this.select(
			Math.min(
				this.selected + 1,
				this.users.length - 1
			)
		)
	}
})

UI.List.Loader = Class.extend({
	init: function(){
		this.div = $('<div>').addClass("loader")
	},
	loading: function(loading){
		if(loading !== undefined){
			if(loading){
				this.div.addClass("loading")
			}else{
				this.div.removeClass("loading")
			}
		}else{
			return this.div.hasClass("loading")
		}
	},
})
