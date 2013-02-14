/** 
Implements a simple event-listener system.  Agents can recieve notifications by
attach()ing callbacks.  Notifcations can then be sent to all callbacks using 
notify().
*/
Event = Class.extend({
	init: function(source){
		this.source = source
		this.listeners = []
	},
	attach: function(callback){
		this.listeners.push(callback)
	},
	notify: function(){
		arguments = Array.prototype.slice.call(arguments)
		arguments.unshift(this.source)
		for(var i=0;i<this.listeners.length;i++){
			this.listeners[i].apply(this.source, arguments)
		}
	}
})

/**
Implements a simple selection and notification interface.
*/
Selectable = Class.extend({
	init: function(instance){
		this.selection   = new Event(instance)
		this.selection.status = false 
	},
	selected: function(selected){
		if(selected === undefined){
			return this.selection.status
		}else{
			//Are we selected or not?
			this.selection.status = Boolean(selected)
			
			//Notify the listeners!
			this.selection.notify(this.selection.status)
			
			return this.selection.status
		}
	}
})



/**
Implements some useful set operations
*/
Set = {
	max: function(a){
		if(a.length == 0){
			throw new Error("Cannot find maximum of an empty list")
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
LOGGING.level = 1 //Default


Page = {
	fullTitle: function(ns, title){
		if(NAMESPACES[ns]){
			return NAMESPACES[ns] + ":" + title
		}else{
			return title
		}
	}
}



WikiDiff = {
	example_table: $("<table><tr>\n  <td colspan=\"2\" class=\"diff-lineno\">Line 1:<\/td>\n  <td colspan=\"2\" class=\"diff-lineno\">Line 1:<\/td>\n<\/tr>\n<tr>\n  <td class=\"diff-marker\">&#160;<\/td>\n  <td class=\"diff-context\"><div>{{user info<\/div><\/td>\n  <td class=\"diff-marker\">&#160;<\/td>\n  <td class=\"diff-context\"><div>{{user info<\/div><\/td>\n<\/tr>\n<tr>\n  <td class=\"diff-marker\">&#160;<\/td>\n  <td class=\"diff-context\"><div>| full name = Aaron Halfaker<\/div><\/td>\n  <td class=\"diff-marker\">&#160;<\/td>\n  <td class=\"diff-context\"><div>| full name = Aaron Halfaker<\/div><\/td>\n<\/tr>\n<tr>\n  <td class=\"diff-marker\">\u2212<\/td>\n  <td class=\"diff-deletedline\"><div>| <span class=\"diffchange diffchange-inline\">Aaron_Halfaker<\/span>image name = <span class=\"diffchange diffchange-inline\">Aaron_Halfaker_sunburst<\/span>.jpg<\/div><\/td>\n  <td class=\"diff-marker\">+<\/td>\n  <td class=\"diff-addedline\"><div>| image name = <span class=\"diffchange diffchange-inline\">Aaron_Halfaker<\/span>.jpg<\/div><\/td>\n<\/tr>\n<tr>\n  <td class=\"diff-marker\">&#160;<\/td>\n  <td class=\"diff-context\"><div>| hover text = Aaron Halfaker, Science Man<\/div><\/td>\n  <td class=\"diff-marker\">&#160;<\/td>\n  <td class=\"diff-context\"><div>| hover text = Aaron Halfaker, Science Man<\/div><\/td>\n<\/tr>\n<tr>\n  <td class=\"diff-marker\">&#160;<\/td>\n  <td class=\"diff-context\"><div>| job title = Research Analyst<\/div><\/td>\n  <td class=\"diff-marker\">&#160;<\/td>\n  <td class=\"diff-context\"><div>| job title = Research Analyst<\/div><\/td>\n<\/tr>\n</table>"),
	line_re: /Line\ ([0-9]+):/,
	parse: function(table){
		var trs = table.find("tr")
		var ops = []
		for(var i=0;i<trs.length;i++){var tr = $(trs[i])
			ops.push(this.parseRow(tr))
		}
		return ops
	},
	parseRow: function(tr){
		if(tr.find('td.diff-lineno').length > 0){
			return this.parseLineNo(tr)
		}else if(tr.find('td.diff-context').length > 0){
			return this.parseContext(tr)
		}else if(tr.find('td.diff-addedline').length > 0 || tr.find('td.diff-deletedline').length > 0){
			return this.parseChange(tr)
		}else{
			throw ["Could not parse.", tr]
		}
		
	},
	parseLineNo: function(tr){
		var match = this.line_re.exec(tr.find('td.diff-lineno').first().text())
		if(match){
			return {
				op: "lineno", 
				line: parseInt(match[1])
			}
		}else{
			throw (
				"Could not interpret line number of diff: " + 
				tr.find('td.diff-lineno').first().text()
			)
		}
	},
	parseContext: function(tr){
		return {
			op: "context", 
			content: tr.find('td.diff-context').first().text()
		}	
	},
	parseChange: function(tr){
		op = {
			op: "change",
			ops: []
		}
		removed = {
			contents: tr.find('td.diff-deletedline > div').contents(),
			c: 0, //content pointer
			i: 0  //character index of a content pointer
		}
		added = {
			contents: tr.find('td.diff-addedline > div').contents(),
			c: 0, //content pointer
			i: 0  //character index of a content pointer
		}
		
		if(added.contents.length && removed.contents.length){
			var i = 0
			while(added.c < added.contents.length || removed.c < removed.contents.length){
				//Still have contents to look at
				var remove = removed.contents[removed.c] 
				var add = added.contents[added.c]
				//console.log([removed.c, remove.nodeType, added.c, add.nodeType])
				
				if(add && add.nodeType == 3 && remove && remove.nodeType == 3){//just context.  Consume minimal
					var consumable = Math.min(
						remove.textContent.length - removed.i,//Potential steps for removal
						add.textContent.length - added.i  //Potential steps for addition
					)
					op.context = Boolean(op.context || consumable >= 3)
					
					op.ops.push({
						op: "context",
						content: remove.textContent.slice(removed.i, removed.i+consumable)
					})
					added.i += consumable
					removed.i += consumable
					if(added.i >= add.textContent.length){
						added.c++
						added.i = 0
					}
					if(removed.i >= remove.textContent.length){
						removed.c++
						removed.i = 0
					}
				}else{
					if(remove && remove.nodeType != 3){
						op.ops.push({
							op: "remove",
							content: remove.textContent
						})
						removed.c++
						removed.i = 0
					}
					if(add && add.nodeType != 3){
						op.ops.push({
							op: "add",
							content: add.textContent
						})
						added.c++
						added.i = 0
					}
				}
				if(++i > 1000){LOGGING.error("Too many diff iterations!  Giving up.")}
			}
		}else if(added.contents.length){
			for(var i=0;i<added.contents.length;i++){
				op.ops.push({
					op: "add",
					content: added.contents[i].textContent
				})
			}
		}else if(removed.contents.length){
			for(var i=0;i<removed.contents.length;i++){
				op.ops.push({
					op: "remove",
					content: removed.contents[i].textContent
				})
			}
		}else{
			LOGGING.debug(["Empty change diff", tr])
		}
		return op
		
	}
}

function wiki_link(title, display){
	if(display == undefined){
		display = title
	}
	return 	$("<a>")
		.text(display)
		.attr('target', "_blank")
		.attr('href', SYSTEM.wiki.root + "/wiki/" + title)
}


