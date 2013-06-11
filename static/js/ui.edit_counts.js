ui = window.ui || {}

ui.EditCounts = Class.extend({
	init: function(){
		
		this.node = $("<div>")
			.addClass("edit_counts")
		
		this.total = {
			node: $("<span>")
				.addClass("total")
		}
		this.node.append(this.total.node)
		
		this.graph = new ui.EditCounts.Graph()
		this.graph_dropper = new ui.Dropper({class: "simple", content: this.graph.node})
		
		this.node.append(this.graph_dropper.node)
	},
	render: function(user, counts){
		this.total.node.text(counts.all || 0)
		this.graph.render(user, counts)
	}
})
ui.EditCounts.Graph = Class.extend({
	init: function(){
		
		this.node = $("<table>")
			.addClass("graph")
			.append($("<caption>").text("by namespace"))
		
	},
	render: function(user, counts){
		this.node.children().remove() //kill the children
		for(var ns in counts){
			if(ns != "all"){
				this.node.append(
					$("<tr>").append(
						$("<th>").append(
							$('<a>')
								.attr('target', "_blank")
								.attr('href', util.user_contribs_href(user.name, ns))
								.text(configuration.mediawiki.namespaces[ns].name || "Article")
						),
						$("<td>").append(
							$("<div>")
								.addClass("bar")
								.addClass("revision")
								.addClass("ns_" + ns)
								.css('width', counts[ns]/counts.all*100 + "%")
								.append($("<span>").text(counts[ns]))
						)
					)
				)
			}
		}
	}
})
