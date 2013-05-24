if(window.console && window.console.log){
	LOGGING = {
		debug: function(loggable){
			var msg = ["DEBUG", loggable]
			if(!LOGGING.level || LOGGING.level <= LOGGING.levels.DEBUG){
				if(console.debug){console.debug(msg)}
				else{console.log(msg)}
			}
		},
		info: function(loggable){
			var msg = ["INFO", loggable]
			if(!LOGGING.level || LOGGING.level <= LOGGING.levels.INFO){
				if(console.info){console.info(msg)}
				else{console.log(msg)}
			}
		},
		error: function(loggable){
			var msg = ["ERROR", loggable]
			if(!LOGGING.level || LOGGING.level <= LOGGING.levels.ERROR){
				if(console.error){console.error(msg)}
				else{console.log(msg)}
			}
		}
	}
}else{
	LOGGING = {
		debug: function(loggable){},
		info: function(loggable){},
		error: function(loggable){}
	}
}
LOGGING.levels = {
	DEBUG: 0,
	INFO:  1,
	ERROR: 2
}
LOGGING.level = 1 //Default
