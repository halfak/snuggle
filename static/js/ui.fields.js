ui = window.ui || {}

ui.Field = Class.extend({
	init: function(id, name, opts){
		opts = opts || {}
		
		this.id   = id
		this.name = name
		
		this.node = $("<div>")
			.addClass("field")
			
		if(opts.tooltip){
			this.node.attr("title", opts.tooltip)
		}
		
		if(opts.class){
			this.node.addClass(opts.class)
		}
		
		if(opts.label){
			this._label = {
				node: $("<label>")
					.attr('for', this.id)
					.append(opts.label || '')
			}
			this.node.append(this._label.node)
		}
		
		this.default = opts.default || ""
		
		this.changed = new Event(this) //This may not work.  
	},
	reset: function(){
		this.val(this.default)
	},
	_changed: function(e){
		return this.changed.notify(e).bool_or()
	}
})
ui.Field.TYPES = {}
ui.Field.from_doc = function(doc, formatting){
	Class = this.TYPES[doc.type] 
	if(Class){
		return Class.from_doc(doc, formatting)
	}else{
		throw "Configuration Error: Field type " + doc.type + " not available."
	}
}

ui.SelectField = ui.Field.extend({
	init: function(name, options, opts){
		opts = opts || {}
		
		var id = opts.id || "select_field_" + new Date().getTime()
		
		this._super(id, name, opts)
		
		this.node.addClass("select")
		
		this._select = {
			node: $("<select>")
				.attr('name', this.name)
				.attr('id', this.id)
				.attr('tabindex', opts.tabindex || 1)
				.change(this._changed.bind(this)),
			labels: {},
			values: {}
		}
		this.node.append(this._select.node)
		
		this._render(options)
		
		if(opts.default){
			this.val(opts.default)
		}
	},
	val: function(value){
		if(value === undefined){
			var label = this._select.node.val()
			return this._select.values[label]
		}else{
			var label = this._select.labels[value]
			this._select.node.val(label)
		}
	},
	disabled: function(disabled){
		if(disabled === undefined){
			return this.node.hasClass("disabled")
		}else{
			if(disabled){
				this.node.addClass("disabled")
				this._select.node.attr('disabled', "disabled")
			}else{
				this.node.removeClass("disabled")
				this.node.removeAttr('disabled')
			}
		}
	},
	_render: function(options){
		for(var i=0;i<options.length;i++){
			var option = options[i]
			var label = String(option.label || option.value)
			this._select.values[label] = option.value
			this._select.labels[option.value] = label
			
			var option_node = $("<option>")
				.attr('value', label)
				.text(label)
			
			if(option.selected){
				option_node.attr('selected', "selected")
			}
			
			this._select.node.append(option_node)
		}
	}
})
ui.SelectField.TYPE = "select"
ui.Field.TYPES[ui.SelectField.TYPE] = ui.SelectField
ui.SelectField.from_doc = function(doc, formatting){
	formatting = formatting || {}
	return new ui.SelectField(
		doc.name,
		doc.options.map(
			function(op){
				return {
					label: (op.label || "").format(formatting),
					value: op.value,
					tooltip: (op.tooltip || "").format(formatting)
				}
			}
		),
		{
			class:   doc.class,
			label:   (doc.label || "").format(formatting),
			tooltip: (doc.tooltip || "").format(formatting),
			default: doc.default
		}
	)
}

ui.RadioField = ui.Field.extend({
	init: function(name, radios, opts){
		opts = opts || {}
		
		var id = opts.id || "radio_field_" + new Date().getTime()
		
		this._super(id, name, opts)
		
		this.node.addClass("radios")
			
		this._radios = {
			node: $("<div>")
				.addClass("radios"),
			values: {}
		}
		this.node.append(this._radios.node)
		
		this.selection = null
		
		for(var i=0;i<radios.length;i++){
			this.append(radios[i])
		}
		if(opts.default){
			logger.debug("radio_field." + name + " set default as " + opts.default)
			this.val(opts.default)
		}
	},
	_handle_radio_checked: function(radio){
		logger.debug("radio_field." + this.name + " changed to " + radio.value)
		this._select_radio(radio)
		this.changed.notify(radio)
	},
	val: function(value, no_notify){
		if(value === undefined){
			if(this.selection){
				return this.selection.value
			}else{
				return null
			}
		}else{
			var radio = this._radios.values[value]
			if(radio){
				this._select_radio(radio)
			}else{
				this._deselect()
			}
		}
	},
	label: function(){
		if(this.selection){
			return this.selection.label
		}else{
			return null
		}
	},
	_deselect: function(){
		if(this.selection){
			logger.debug("radio_field." + this.name + " deselecting radio." + this.selection.label)
			this.selection.selected(false)
		}
	},
	_select_radio: function(radio){
		if(this.selection != radio){
			this._deselect()
			
			logger.debug("radio_field." + this.name + " selecting radio." + radio.label)
			this.selection = radio
			this.selection.selected(true)
			return true
		}else{
			return false
		}
	},
	disabled: function(disabled){
		if(disabled === undefined){
			return this.node.hasClass("disabled")
		}else{
			if(disabled){
				this.node.addClass("disabled")
			}else{
				this.node.removeClass("disabled")
			}
			this._radios.values.values().map(function(radio){radio.disabled(disabled)})
		}
	},
	append: function(radio){
		radio.set_name(this.name)
		this._radios.node.append(radio.node)
		this._radios.values[radio.value] = radio
		radio.checked.attach(this._handle_radio_checked.bind(this))
	}
})
ui.RadioField.TYPE = "radio"
ui.Field.TYPES[ui.RadioField.TYPE] = ui.RadioField
ui.RadioField.from_doc = function(doc, formatting){
	formatting = formatting || {}
	
	var radios = []
	var radio_docs = doc.options || []
	for(var i=0;i<radio_docs.length;i++){
		var radio_doc = radio_docs[i]
		var radio = new ui.RadioField.Radio(
			(radio_doc.label || "").format(formatting),
			radio_doc.value, 
			{
				class: radio_doc.class,
				tooltip: (radio_doc.tooltip || "").format(formatting),
				tabindex: doc.tabindex
			}
		)
		radios.push(radio)
	}
	return new ui.RadioField(
		doc.name,
		radios,
		{
			class:   doc.class,
			label:   (doc.label || "").format(formatting),
			tooltip: (doc.tooltip || "").format(formatting),
			default: doc.default
		}
	)
}


ui.RadioField.Radio = Class.extend({
	init: function(label, value, opts){
		opts = opts || {}
		
		this.label = label
		this.value = value
		
		this.node = $("<div>")
			.addClass("radio_option")
			.addClass("clickable")
			.click(this._handle_click.bind(this))
		
		if(opts.tooltip){
			this.node.attr('title', opts.tooltip)
		}
		if(opts.class){
			this.node.addClass(opts.class)
		}
		
		this._input = {
			node: $("<input>")
				.attr('type', "radio")
				.attr('tabindex', opts.tabindex || 1)
				.keydown(util.stop_propagation)
				.change(this._handle_check.bind(this)) // Douchebag event says "change", means "check"
		}
		this.node.append(this._input.node)
		
		this._label = {
			node: $("<label>")
				.html(label)
		}
		this.node.append(this._label.node)
		
		this.checked = new Event(this)
	},
	_handle_click: function(e){
		logger.debug("radio." + this.label + " handling click")
		if(!this.disabled()){
			this.selected(true)
			util.stop_propagation(e)
		}
	},
	_handle_check: function(e){
		// Note that this function will only be called when the user clicks
		// on the radio button.  
		
		//logger.debug("radio." + this.label + " handling user check")
		
		//By calling this function, we make the behavior uniform. 
		//this.selected(true)
		
	},
	set_name: function(name){
		this.id = name + "_" + this.value
		
		this._input.node.attr('name', name)
		this._input.node.attr('id', this.id)
		//this._label.node.attr('for', this.id)
	},
	disabled: function(disabled){
		if(disabled === undefined){
			return this.node.hasClass("disabled")
		}else{
			if(disabled){
				this.node.addClass("disabled")
				this._input.node.attr('disabled', true)
			}else{
				this.node.removeClass("disabled")
				this._input.node.removeAttr('disabled')
			}
		}
	},
	selected: function(selected){
		if(selected === undefined){
			return this.node.hasClass("selected")
		}else{
			logger.debug("radio." + this.label + " is set to " + Boolean(selected))
			if(selected){
				if(!this.selected()){
					this.node.addClass("selected")
					this.checked.notify()
				}
			}else{
				this.node.removeClass("selected")
			}
			this._checked(selected)
		}
	},
	_checked: function(checked){
		if(checked === undefined){
			return this._input.node.is(":checked")
		}else{
			if(checked){
				this._input.node.attr('checked', "checked")
			}else{
				this._input.node.removeAttr('checked')
			}
		}
	}
})

ui.TextField = ui.Field.extend({
	init: function(name, opts){
		opts = opts || {}
		
		var id = opts.id || "text_field_" + new Date().getTime()
		
		this._super(id, name, opts)
		
		this.node.addClass("text")
		
		this._input = {
			node: $("<input>")
				.attr('id', this.id)
				.attr('type', opts.password ? "password" : "text")
				.attr('tabindex', opts.tabindex || 1)
				.keydown(this._handle_keypressed.bind(this))
		}
		this.node.append(this._input.node)
		
		this.keypressed = new Event(this)
		
		if(opts.default){
			this.val(opts.default)
		}
	},
	_handle_keypressed: function(e){
		this.keypressed.notify(e)
		this.changed.notify()
	},
	val: function(val){
		if(val === undefined){
			return this._input.node.val()
		}else{
			this._input.node.val(val)
		}
	},
	disabled: function(disabled){
		if(disabled === undefined){
			return this.node.hasClass("disabled")
		}else{
			if(disabled){
				this.node.addClass("disabled")
				this._input.node.attr('disabled', true)
			}else{
				this.node.removeClass("disabled")
				this._input.node.removeAttr('disabled')
			}
		}
	},
	focus: function(){
		this._input.node.focus()
	}
})
ui.TextField.TYPE = "text"
ui.Field.TYPES[ui.TextField.TYPE] = ui.TextField
ui.TextField.from_doc = function(doc, formatting){
	formatting = formatting || {}
	return new ui.TextField(
		doc.name,
		{
			class:    doc.class,
			label:    (doc.label || "").format(formatting),
			tooltip:  (doc.tooltip || "").format(formatting),
			default:  (doc.default || "").format(formatting),
			tabindex: doc.tabindex
		}
	)
}

ui.TextareaField = ui.Field.extend({
	init: function(name, opts){
		opts = opts || {}
		
		var id = opts.id || "textarea_field_" + new Date().getTime()
		
		this._super(id, name, opts)
		
		this.node.addClass("textarea")
		
		this._textarea = {
			node: $("<textarea>")
				.attr('id', this.id)
				.attr('tabindex', opts.tabindex || 1)
				.keydown(this._key_pressed.bind(this))
		}
		this.node.append(this._textarea.node)
		
		this.key_pressed = new Event(this)
		
		if(opts.default){
			this.val(opts.default)
		}
	},
	_key_pressed: function(e){
		this.key_pressed.notify(e)
		this.changed.notify()
	},
	val: function(val){
		if(val === undefined){
			return this._textarea.node.val()
		}else{
			this._textarea.node.val(val)
		}
	},
	disabled: function(disabled){
		if(disabled === undefined){
			return this.node.hasClass("disabled")
		}else{
			if(disabled){
				this.node.addClass("disabled")
				this._textarea.node.attr('disabled', true)
			}else{
				this.node.removeClass("disabled")
				this._textarea.node.removeAttr('disabled')
			}
		}
	},
	focus: function(){
		this._textarea.node.focus()
	}
})
ui.TextareaField.TYPE = "textarea"
ui.Field.TYPES[ui.TextareaField.TYPE] = ui.TextareaField
ui.TextareaField.from_doc = function(doc, formatting){
	formatting = formatting || {}
	
	return new ui.TextareaField(
		doc.name,
		{
			class:    doc.class,
			label:    (doc.label || "").format(formatting),
			tooltip:  (doc.tooltip || "").format(formatting),
			default:  (doc.default || "").format(formatting),
			tabindex: doc.tabindex
		}
	)
}

ui.CheckField = ui.Field.extend({
	init: function(name, opts){
		opts = opts || {}
		
		var id = "check_field_" + new Date().getTime()
		
		this._super(id, name, opts)
		
		this.node.addClass("check")
		
		// Normally, this is set in the parent class, but in this case, we want
		// the whole field to have a tooltip.
		if(opts.tooltip){
			this.node.attr('title', opts.tooltip)
		}
		
		this._input = {
			node: $("<input>")
				.attr('id', this.id)
				.attr('type', "checkbox")
				.attr('tabindex', opts.tabindex || 1)
				.change(this._changed.bind(this))
				.keydown(util.stop_propagation)
				
		}
		this.node.prepend(this._input.node) //Prepended to get in front of the label.
		
		this.val(opts.default)
	},
	_changed: function(e){
		if(this.val()){
			this.node.addClass("checked")
		}else{
			this.node.removeClass("checked")
		}
		this.changed.notify(this.val())
	},
	val: function(value){
		if(value === undefined){
			return this._input.node.is(":checked")
		}else{
			if(value){
				this._input.node.attr("checked", "checked")
			}else{
				this._input.node.removeAttr("checked")
			}
		}
	},
	disabled: function(disabled){
		if(disabled === undefined){
			return this.node.hasClass("disabled")
		}else{
			if(disabled){
				this.node.addClass("disabled")
				this._input.node.attr('disabled', true)
			}else{
				this.node.removeClass("disabled")
				this._input.node.removeAttr('disabled')
			}
		}
	},
	focus: function(){
		this._input.node.focus()
	}
})
ui.CheckField.TYPE = "check"
ui.Field.TYPES[ui.CheckField.TYPE] = ui.CheckField
ui.CheckField.from_doc = function(doc, formatting){
	formatting = formatting || {}
	return new ui.CheckField(
		doc.name,
		{
			class:    doc.class,
			label:    (doc.label || "").format(formatting),
			tooltip:  (doc.tooltip || "").format(formatting),
			default:  (doc.default || ""),
			tabindex: doc.tabindex
		}
	)
}
