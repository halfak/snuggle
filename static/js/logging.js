logging = {
	DEBUG: {val: 0, name: "DEBUG"},
	INFO: {val: 1, name: "INFO"},
	WARNING: {val: 2, name: "WARNING"},
	ERROR: {val: 3, name: "ERROR"}
}

logging.Logger = Class.extend({
	init: function(console_level){
		this.console = new logging.Console(console_level)
		
		this.history = []
	},
	log: function(message){
		this.console.log(message)
		
		this.history.push(message)
	},
	debug: function(loggable){
		this.log(new logging.Message(logging.DEBUG, loggable))
	},
	info: function(loggable){
		this.log(new logging.Message(logging.INFO, loggable))
	},
	warning: function(loggable){
		this.log(new logging.Message(logging.WARNING, loggable))
	},
	error: function(loggable){
		this.log(new logging.Message(logging.ERROR, loggable))
	},
	recent_messages: function(min_level, max){
		min_level = min_level || Logger.INFO
		messages = []
		for(var i=this.history.length-1;i>=0;i--){
			var message = this.history[i]
			if(message.level.val >= min_level.val){
				messages.push(message)
			}
			if(max && messages.length >= max){
				break
			}
		}
		return messages
	}
})
logging.Message = Class.extend({
	init: function(level, loggable, timestamp){
		this.level = level
		this.loggable = loggable
		this.timestamp = timestamp || new Date()
	},
	pp: function(){
		return this.timestamp.format("isoTime") + " [" + this.level.name + "] " + this.loggable
	}
})
logging.Console = Class.extend({
	init: function(min_level){
		this.min_level = min_level
	},
	log: function(message){
		
		if(message.level.val >= this.min_level.val){
			switch(message.level){
				case logging.DEBUG:
					this.debug(message.pp())
					break
				case logging.INFO:
					this.info(message.pp())
					break
				case logging.WARNING:
					this.warning(message.pp())
					break
				case logging.ERROR:
					this.error(message.pp())
					break
				default:
					throw "Unknown logging level " + message.level
			}
		}
	},
	debug: function(content){
		if(console.debug){
			console.debug(content)
		}else if(console.log){
			console.log(content)
		}
	},
	info: function(content){
		if(console.info){
			console.info(content)
		}else if(console.log){
			console.log(content)
		}
	},
	warn: function(content){
		if(console.warn){
			console.warn(content)
		}else if(console.log){
			console.log(content)
		}
	},
	error: function(content){recent
		if(console.error){
			console.error(content)
		}else if(console.log){
			console.log(content)
		}
	}
})


//Set a default
logger = new logging.Logger(logging.DEBUG)
