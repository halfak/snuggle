UI = window.UI || {}

UI.SingleSelect = Class.extend({
	init: function(options, o){
		o = o || {}
		this.options = {}
		
		this.node = $("<div>")
			.addClass("single_select")
		
		if(o.class){
			this.node.addClass(o.class)
		}
		
		this.selection = null
		
		this.changed = new Event(this)
		
		this._render(options)
	},
	val: function(val){
		if(val === undefined){
			if(this.selection){
				return this.selection.value
			}else{
				return null
			}
		}else{
			if(this.options[val]){
				return this.update_selection(this.options[val])
			}else{
				throw "Can't update selection to " + val + ".  Value not available."
			}
		}
	},
	label: function(){
		if(this.selection){
			return this.selection.label.value
		}else{
			return null
		}
	},
	update_selection: function(option){
		if(this.selection !== option){
			if(this.selection){
				this.selection.selected(false)
			}
			
			this.selection = option
			
			if(this.selection){
				this.selection.selected(true)
			}
			this.changed.notify(option)
		}
	},
	_render: function(options){
		for(var i=0;i<options.length;i++){
			var option = new UI.SingleSelect.Option(
				options[i].value,
				options[i].label,
				options[i].o
			)
			this.options[option.value] = option
			option.clicked.attach(this.update_selection.bind(this))
			this.node.append(option.node)
		}
	}
})

UI.SingleSelect.Option = Class.extend({
	init: function(value, label, o){
		label = label || value
		o = o || {}
		
		this.value = value
		
		this.node = $("<div>")
			.addClass("option")
			.click(function(e){this.clicked.notify()}.bind(this))
		
		if(o.class){
			this.node.addClass(o.class)
		}
		
		this.label = {
			node: $("<span>")
				.addClass("label")
				.text(label),
			value: label
		}
		this.node.append(this.label.node)
		
		this.clicked = new Event(this)
	},
	selected: function(selected){
		if(selected === undefined){
			return this.node.hasClass("selected")
		}else{
			if(selected){
				this.node.addClass("selected")
			}else{
				this.node.removeClass("selected")
			}
		}
	}
})


UI.DefinitionList = Class.extend({
	init: function(cl){
		this.node = $("<div>")
			.addClass("definition_list")
		
		if(cl){
			this.node.addClass(cl)
		}
	},
	hide: function(){
		this.node.hide()
	},
	show: function(){
		this.node.show()
	},
	render: function(map){
		this.node.children().detach() //Clear out the space
		for(key in map){
			this.node.append(
				$("<dl>")
					.addClass(key)
					.append($("<dt>").append(key))
					.append($("<dd>").append(map[key]))
			)
		}
	}
})

UI.EditCounts = Class.extend({
	init: function(counts){
		counts = counts || {}
		
		this.node = $("<span>")
			.addClass("edit_counts")
		
		this.total = {
			node: $("<span>")
				.addClass("total")
				.text(counts.all || 0)
		}
		this.node.append(this.total.node)
		
		this.graph = new UI.EditCounts.Graph(counts)
		this.graph_dropper = new UI.Dropper("", this.graph.node, {class: "simple"})
		
		this.node.append(this.graph_dropper.node)
	},
	render: function(counts){
		counts = counts || {}
		
		this.total.node.text(counts.all || 0)
		this.graph.render(counts)
	}
})
UI.EditCounts.Graph = Class.extend({
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
						$("<th>").text(NAMESPACES[ns] || "Article"),
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
