logging = {}

logging.Logger = Class.extend({
	init: function(console_level){
		this.console_level = console_level
		
		this.history = []
	},
	debug: function(loggable){
		var msg = ["DEBUG", loggable]
		if(!this.level || this.console_level <= logging.levels.DEBUG){
			if(console.debug){console.debug(msg)}
			else{console.log(msg)}
		}
		this.history.push(msg)
	},
	info: function(loggable){
		var msg = ["INFO", loggable]
		if(!this.level || this.console_level <= logging.levels.INFO){
			if(console.info){console.info(msg)}
			else{console.log(msg)}
		}
		this.history.push(msg)
	},
	warning: function(loggable){
		var msg = ["WARNING", loggable]
		if(!this.level || this.console_level <= logging.levels.WARNING){
			if(console.warn){console.warn(msg)}
			else{console.log(msg)}
		}
		this.history.push(msg)
	},
	error: function(loggable){
		var msg = ["ERROR", loggable]
		if(!this.level || this.console_level <= logging.levels.ERROR){
			if(console.error){console.error(msg)}
			else{console.log(msg)}
		}
		this.history.push(msg)
	},
	recent_messages: function(min_level, max){
		min_level = min_level || Logger.INFO
		messages = []
		for(var i=this.history.length-1;i>=0;i--){
			var message = this.history[i]
			if(logging.levels[message[0]] >= min_level){
				messages.push(message)
			}
			if(max && messages.length >= max){
				break
			}
		}
		return messages
	}
})
logging.levels = {
	DEBUG: 0,
	INFO: 1,
	WARNING: 2,
	ERROR: 3
}


//Set a default
logger = new logging.Logger(logging.levels.INFO)
