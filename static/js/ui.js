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
		this.node.html('') //Clear out the space
		for(key in map){
			this.node.append(
				$("<dl>")
					.append($("<dt>").text(key))
					.append($("<dd>").text(map[key]))
			)
		}
	}
})

UI.EditCount = Class.extend({
	init: function(){
		this.node = $("<div>")
			.addClass("edit_count")
		
		this.header = {
			node: $("<dl>")
				.addClass("header")
				.append($("<dt>").text("Edits"))
		}
		this.node.append(this.header.node)
		
		this.total = {
			node: $("<dd>")
		}
		this.header.node.append(this.total.node)
		
		this.body = {
			node: $("<dl>")
				.addClass("namespaces")
		}
		this.node.append(this.body.node)
	},
	hide: function(){
		this.node.hide()
	},
	show: function(){
		this.node.show()
	},
	render: function(counts){
		this.body.node.html("") //Clear out the space
		var max   = 0
		var total = counts['all'] || 0
		for(ns in counts){
			if(ns != "all"){
				max = Math.max(max, counts[ns])
			}
		}
		
		this.total.node.text(total)
		
		for(ns in counts){
			if(ns != "all"){
				this.body.node.append(
					$("<dl>")
						.addClass(NAMESPACES[ns])
						.append(
							$("<dt>").text(NAMESPACES[ns] || "Article")
						)
						.append(
							$("<dd>")
								.css("width", (counts[ns]/max)*100 + "%")
								.text(counts[ns])
						)
				)
			}
		}
	}
})

UI.Select = Class.extend({
	init: function(name, options, o){
		o = o || {}
		
		this.name    = name
		
		this.node = $("<select>")
			.attr('name', name)
			.attr('id', name)
			.change(function(e){this.changed.notify(this.val())}.bind(this))
		
		if(o.class){
			this.node.addClass(o.class)
		}
		
		this.changed = new Event(this)
		
		this._render(options || [])
	},
	val: function(val){
		if(val === undefined){
			return this.node.val()
		}else{
			this.node.val(val)
		}
		
	},
	_render: function(options){
		for(var i=0;i<options.length;i++){
			var option = options[i]
			this.node.append(
				$("<option>")
					.attr('value', option.value)
					.text(option.label || option.value)
			)
		}
	}
})

UI.Radios = Class.extend({
	init: function(name, options, o){
		this.name = name
		this.options = {}
		
		this.node = $("<div>")
			.attr('name', name)
			.attr('id', name)
			.addClass("radios")
		
		this.changed = new Event(this)
		
		this.selection = null
		
		this._render(options || [])
		
	},
	val: function(val){
		if(val === undefined){
			if(this.selection){
				return this.selection.value
			}else{
				return null
			}
		}else{
			this.selection = this.options[val] || null
			if(this.selection){
				this.options[val].checked(true)
			}
			
		}
	},
	_render: function(options){
		for(var i=0;i<options.length;i++){
			var option = options[i]
			var radio = new UI.Radio(this.name, option.value, option.label)
			radio.button_checked.attach(this._radio_checked.bind(this))
			this.node.append(radio.node)
			this.options[radio.value] = radio
		}
	},
	_radio_checked: function(radio, value){
		this.selection = radio
		this.changed.notify(value)
	}
})

UI.Radio = Class.extend({
	init: function(name, value, label){
		this.value = value
		
		this.node = $("<div>")
			.addClass("radio")
		
		this.button = {
			node: $("<input>")
				.attr('type', "radio")
				.attr('id', name + "_" + value)
				.attr('name', name)
				.change(this._handle_change.bind(this))
		}
		this.node.append(this.button.node)
		
		this.label = {
			node: $("<label>")
				.attr('for', name + "_" + value)
				.text(label || value)
		}
		this.node.append(this.label.node)
		
		this.button_checked = new Event(this)
	},
	checked: function(checked){
		if(checked === undefined){
			return this.button.node.is(":checked")
		}else{
			if(checked){
				this.button.node.attr('checked', "checked")
			}else{
				this.button.node.removeAttr('checked', "checked")
			}
		}
	},
	_handle_change: function(e){
		if(this.checked()){
			this.button_checked.notify(this.value)
		}
	}
})

UI.TextField = Class.extend({
	/**
	:Parameters:
		opts : object
			password : boolean
				should the field hide the characters like a password
			value : string
				default value to be placed in the field
			empty : string
				a value to be placed in the field when it is left empty
	*/
	init: function(opts){
		
		this.node = $("<div>")
			.addClass("text_field")
		
		var id = "text_field_" + new Date().getTime()
		
		this.label = {
			node: $("<label>")
				.attr('id', id)
				.append(opts.label || '')
		}
		this.node.append(this.label.node)
		
		this.input = {
			node: $("<input>")
				.attr('id', id)
				.attr('type', opts.password ? "password" : "text")
				
		}
		this.node.append(this.input.node)
		
		if(opts.value){
			this.input.node.val(opts.value)
		}else if(opts.empty){
			this.empty = opts.empty
			this.input.node.val(this.empty)
			this.input.node.bind("focus blur", this._input_blur_empty.bind(this))
		}
		
	},
	_input_blur_empty: function(e){
		if(e.type == "focus"){
			if(this.input.node.val() == this.empty){
				this.input.node.val("")
			}
		}else if(e.type == "blur"){
			if(this.input.node.val().trim() == ""){
				this.input.node.val(this.empty)
			}
		}
	},
	val: function(val){
		if(val === undefined){
			if(this.input.node.val() == this.empty){
				return ''
			}else{
				return this.input.node.val()
			}
		}else{
			this.input.node.val(val)
		}
	}
})
