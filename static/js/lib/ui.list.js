UI = window.UI || {}
UI.List = Class.extend({
	init: function(){
		this.div = $('<div>').attr('id', "list")
		this.users = []
		this.selected = -1
		
		this.body = $('<div>').addClass("body")
		this.div.append(this.body)
		
		this.loader = new UI.List.Loader()
		this.div.append(this.loader.div)
		
		$(window).keydown(function(e){
			if(this.selected != -1){
				relevant = false
				switch(e.which){
					case 33: //page down
						this.previous() //Go to previous user
						relevant = true
						break;
					case 34: //page up
						this.next() //Go to next user
						relevant = true
						break;
					case 37: //left
						this.users[this.selected].activity.shift({x:-1,y:0})
						relevant = true
						break;
					case 38: //up
						this.users[this.selected].activity.shift({x:0,y:1})
						relevant = true
						break;
					case 39: //right
						this.users[this.selected].activity.shift({x:1,y:0})
						relevant = true
						break;
					case 40: //down
						this.users[this.selected].activity.shift({x:0,y:-1})
						relevant = true
						break;
					case 27: //esc
						this.users[this.selected].activity.select(null)
						relevant = true
						break;
				}
				if(relevant){
					return false
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
		this.select(0)
	},
	selectUser: function(user){
		for(var i in this.users){var luser = this.users[i]
			if(luser.id == user.id){
				this.select(parseInt(i))
				break
			}
		}
	},
	select: function(i){
		if(this.selected != i){
			if(this.selected != -1){
				this.users[this.selected].selected(false)
			}
			if(i != -1){
				this.users[i].selected(true)
				this.scrollToUser(this.users[i])
			}
		}
		console.log(i)
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
	},
	scrollToUser: function(user){
		if(user){
			if(user.top() < 25){
				this.div.scrollTop(this.div.scrollTop() + user.top() - 25)
			}else if(user.bottom() > this.div.height()){
				this.div.scrollTop(this.div.scrollTop() + (user.bottom() - this.div.height()) + 25)
			}
		}
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
