ui = window.ui || {}

ui.EditCounts = Class.extend({
	init: function(counts){
		counts = counts || {}
		
		this.node = $("<div>")
			.addClass("edit_counts")
		
		this.total = {
			node: $("<span>")
				.addClass("total")
				.text(counts.all || 0)
		}
		this.node.append(this.total.node)
		
		this.graph = new ui.EditCounts.Graph(counts)
		this.graph_dropper = new ui.Dropper("", this.graph.node, {class: "simple"})
		
		this.node.append(this.graph_dropper.node)
	},
	render: function(counts){
		counts = counts || {}
		
		this.total.node.text(counts.all || 0)
		this.graph.render(counts)
	}
})
ui.EditCounts.Graph = Class.extend({
	init: function(counts){
		counts = counts || {}
		
		this.node = $("<table>")
			.addClass("graph")
			.append($("<caption>").text("by namespace"))
		
		this.render(counts)
	},
	render: function(counts){
		this.node.children().remove() //kill the children
		for(var ns in counts){
			if(ns != "all"){
				this.node.append(
					$("<tr>").append(
						$("<th>").text(configuration.mediawiki.namespaces[ns] || "Article"),
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
