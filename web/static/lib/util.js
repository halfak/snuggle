Constants = {
	DAY: 60*60*24
}

Set = {
	max: function(a){
		if(a.length == 0){
			throw "Cannot find maximum of an empty list"
		}
		maximum = 0
		for(var i in a){
			maximum = Math.max(maximum, a[i])
		}
		return maximum
	},
	group: function(a, by){
		by = by || function(item){return item}
		
		var groups = new Object()
		
		for(var i in a){
			var item = a[i]
			var id   = by(item)
			if(groups[id]){
				groups[id].push(item)
			}else{
				groups[id] = [item]
			}
		}
		
		return groups
	}
}

Object.defineProperty(Object.prototype, 'keys',{
	value: function(){
		  var keys = []
		
		for(var key in this){
			if(this.hasOwnProperty(key)){
				keys.push(key)
			}
		}
		
		return keys;
	},
	writable: true,
	configurable: true,
	enumerable: false
})

Object.defineProperty(Object.prototype, 'values',{
	value: function(){
		var values = []
		
		for(var key in this){
			if(this.hasOwnProperty(key)){
				values.push(this[key])
			}
		}
		
		return values;
	},
	writable: true,
	configurable: true,
	enumerable: false
})

Date.prototype.wikiFormat = function(){
	return this.toUTCString()
}

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
LOGGING.level = 0 //Default

