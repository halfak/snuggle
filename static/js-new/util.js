util = {
	LINK_RE: /\[\[([^\]|]+)(\|([^\]]+))?\]\]/g,
	link_replace: function(match, page_name, _, display){
		a = util.wiki_link(page_name, display)
		return $("<div>").append(a).html()
	},
	linkify: function(markup){
		return markup.replace(util.LINK_RE, util.link_replace)
	},
	page_name: function(ns, title){
		return MEDIAWIKI.namespaces[ns].prefixes[0] + title
	},
	page_link: function(page_name){
		return MEDIAWIKI.protocol + "://" + 
		       MEDIAWIKI.domain + 
		       MEDIAWIKI.path.pages + 
		       page_name
	},
	rev_diff_link: function(rev_id){
		return MEDIAWIKI.protocol + "://" + 
			   MEDIAWIKI.domain + 
			   MEDIAWIKI.path.scripts + 
			   MEDIAWIKI.file.index + 
			   "?diff=prev&oldid=" + rev_id
	},
	user_link: function(username){
		return util.page_link(util.page_name(2, username))
	},
	user_talk_link: function(username){
		return util.page_link(util.page_name(3, username))
	},
	user_contribs_link: function(username){
		return util.page_link(util.page_name(-1, "Contributions/" + username))
	},
	wiki_link: function(page_name, display){
		if(display == undefined){
			display = page_name
		}
		return $("<a>")
			.text(display)
			.attr('target', "_blank")
			.attr('href', util.page_link(page_name))
			.addClass("wiki-link")
	}
}

Array.prototype.max = function(){
	if(this.length == 0){
		throw new Error("Cannot find maximum of an empty list")
	}
	maximum = 0
	for(var i in this){
		maximum = Math.max(maximum, this[i])
	}
	return maximum
}

Array.prototype.group = function(by){
	by = by || function(item){return item}
		
	var groups = new Object()
	
	for(var i in this){
		var item = this[i]
		var id   = by(item)
		if(groups[id]){
			groups[id].push(item)
		}else{
			groups[id] = [item]
		}
	}
	
	return groups
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



