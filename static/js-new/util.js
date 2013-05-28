util = {
	LINK_RE: /\[\[([^\]|]+)(\|([^\]]+))?\]\]/g,
	link_replace: function(match, page_name, _, display){
		return util.htmlify(util.wiki_link(page_name, display))
	},
	linkify: function(markup){
		return markup.replace(util.LINK_RE, util.link_replace)
	},
	page_name: function(ns, title){
		return configuration.mediawiki.namespaces[ns].prefixes[0] + title
	},
	page_link: function(page_name){
		return configuration.mediawiki.protocol + "://" + 
		       configuration.mediawiki.domain + 
		       configuration.mediawiki.path.pages + 
		       page_name
	},
	rev_diff_link: function(rev_id){
		return configuration.mediawiki.protocol + "://" + 
			   configuration.mediawiki.domain + 
			   configuration.mediawiki.path.scripts + 
			   configuration.mediawiki.file.index + 
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
	},
	htmlify: function(element){
		return $("<div>").append(element).html()
	},
	stop_propagation: function(e){
		e.stopPropagation()
	},
	now_ms: function(){
		return new Date() * 1
	}
}





