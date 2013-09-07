util = {
	LINK_RE: /\[\[:?([^\]|]+)(\|([^\]]+))?\]\]/g,
	link_replace: function(match, page_name, _, display){
		display = display || page_name
		return util.htmlify(util.wiki_link(page_name, display))
	},
	linkify: function(markup){
		return markup.replace(util.LINK_RE, util.link_replace)
	},
	page_name: function(ns, title){
		return configuration.mediawiki.namespaces[ns].prefixes[0] + title
	},
	page_href: function(page_name){
		return configuration.mediawiki.protocol + "://" + 
		       configuration.mediawiki.domain + 
		       configuration.mediawiki.path.pages + 
		       page_name
	},
	rev_diff_href: function(rev_id){
		return configuration.mediawiki.protocol + "://" + 
		       configuration.mediawiki.domain + 
		       configuration.mediawiki.path.scripts + 
		       configuration.mediawiki.file.index + 
		       "?diff=prev&oldid=" + rev_id
	},
	user_href: function(username){
		return util.page_href(util.page_name(2, username))
	},
	user_talk_href: function(username){
		return util.page_href(util.page_name(3, username))
	},
	user_contribs_href: function(username, ns){
		var href = util.page_href(util.page_name(-1, "Contributions/" + username))
		if(ns){
			href += "?namespace=" + ns
		}
		return href
	},
	wiki_link: function(page_name, display){
		if(display == undefined){
			display = page_name
		}
		return $("<a>")
			.html(display)
			.attr('target', "_blank")
			.attr('href', util.page_href(page_name))
			.addClass("wiki-link")
	},
	htmlify: function(element){
		return $("<div>").append(element).html()
	},
	stop_propagation: function(e){
		logger.debug("Stopping propagation for event " + e.type)
		e.stopPropagation()
	},
	kill_event: function(e){
		logger.debug("killing event " + e.type)
		e.stopPropagation()
		e.preventDefault()
	},
	now_ms: function(){
		return new Date() * 1
	},
	wiki_diff: {
		line_re: /[a-z]\ (([0-9]+,?)+):/,
		parse: function(table){
			var trs = table.find("tr")
			var ops = []
			for(var i=0;i<trs.length;i++){var tr = $(trs[i])
				ops.push(this.parse_row(tr))
			}
			return ops
		},
		parse_row: function(tr){
			if(tr.find('td.diff-lineno').length > 0){
				return this.parse_line_no(tr)
			}else if(tr.find('td.diff-context').length > 0){
				return this.parse_context(tr)
			}else if(tr.find('td.diff-addedline > div').length > 0 || 
					 tr.find('td.diff-deletedline > div').length > 0){
				return this.parse_change(tr)
			}else if(tr.find('td.diff-addedline').length > 0 || 
					 tr.find('td.diff-deletedline').length > 0){
				return this.parse_line(tr)
			}else{
				throw ["Could not parse.", tr]
			}
			
		},
		parse_line_no: function(tr){
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
		parse_context: function(tr){
			return {
				op: "context", 
				content: tr.find('td.diff-context').first().text()
			}
		},
		parse_line: function(tr){
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
		parse_change: function(tr){
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
}





