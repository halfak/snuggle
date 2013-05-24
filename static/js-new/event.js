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




WikiDiff = {
	example_table: $("<table><tr>\n  <td colspan=\"2\" class=\"diff-lineno\">Line 1:<\/td>\n  <td colspan=\"2\" class=\"diff-lineno\">Line 1:<\/td>\n<\/tr>\n<tr>\n  <td class=\"diff-marker\">&#160;<\/td>\n  <td class=\"diff-context\"><div>{{user info<\/div><\/td>\n  <td class=\"diff-marker\">&#160;<\/td>\n  <td class=\"diff-context\"><div>{{user info<\/div><\/td>\n<\/tr>\n<tr>\n  <td class=\"diff-marker\">&#160;<\/td>\n  <td class=\"diff-context\"><div>| full name = Aaron Halfaker<\/div><\/td>\n  <td class=\"diff-marker\">&#160;<\/td>\n  <td class=\"diff-context\"><div>| full name = Aaron Halfaker<\/div><\/td>\n<\/tr>\n<tr>\n  <td class=\"diff-marker\">\u2212<\/td>\n  <td class=\"diff-deletedline\"><div>| <span class=\"diffchange diffchange-inline\">Aaron_Halfaker<\/span>image name = <span class=\"diffchange diffchange-inline\">Aaron_Halfaker_sunburst<\/span>.jpg<\/div><\/td>\n  <td class=\"diff-marker\">+<\/td>\n  <td class=\"diff-addedline\"><div>| image name = <span class=\"diffchange diffchange-inline\">Aaron_Halfaker<\/span>.jpg<\/div><\/td>\n<\/tr>\n<tr>\n  <td class=\"diff-marker\">&#160;<\/td>\n  <td class=\"diff-context\"><div>| hover text = Aaron Halfaker, Science Man<\/div><\/td>\n  <td class=\"diff-marker\">&#160;<\/td>\n  <td class=\"diff-context\"><div>| hover text = Aaron Halfaker, Science Man<\/div><\/td>\n<\/tr>\n<tr>\n  <td class=\"diff-marker\">&#160;<\/td>\n  <td class=\"diff-context\"><div>| job title = Research Analyst<\/div><\/td>\n  <td class=\"diff-marker\">&#160;<\/td>\n  <td class=\"diff-context\"><div>| job title = Research Analyst<\/div><\/td>\n<\/tr>\n</table>"),
	line_re: /Line\ (([0-9]+,?)+):/,
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
		}else if(tr.find('td.diff-addedline > div').length > 0 || 
			     tr.find('td.diff-deletedline > div').length > 0){
			return this.parseChange(tr)
		}else if(tr.find('td.diff-addedline').length > 0 || 
			     tr.find('td.diff-deletedline').length > 0){
			return this.parseLine(tr)
		}else{
			throw ["Could not parse.", tr]
		}
		
	},
	parseLineNo: function(tr){
		var match = this.line_re.exec(tr.find('td.diff-lineno').first().text())
		if(match){
			return {
				op: "lineno", 
				line: parseInt(match[1].replace(",", ""))
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
	parseLine: function(tr){
		if(tr.find('td.diff-addedline').length > 0){
			return {
				op: "added_line",
				content: ""
			}
		}else if(tr.find('td.diff-deletedline').length > 0){
			return {
				op: "removed_line",
				content: ""
			}
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




