ui = window.ui || {}

ui.Field = Class.extend({
	init: function(id, name, opts){
		opts = opts || {}
		
		this.id   = id
		this.name = name
		
		this.node = $("<div>")
			.addClass("field")
		
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
			
			if(opts.tooltip){
				this._label.node.attr("title", opts.tooltip)
			}
		}
		
		this.default = opts.default || ""
		
		this.changed = new Event(this) //This may not work.  
	},
	reset: function(){
		this.val(this.default)
	},
	_changed: function(e){
		this.changed.notify()
	}
})
ui.Field.TYPES = {}
ui.Field.from_doc = function(doc){
	Class = this.TYPES[doc.type] 
	if(Class){
		return Class.from_doc(doc)
	}else{
		throw "Configuration Error: Field type " + doc.type + " not available."
	}
}.bind(ui.Field)

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
ui.SelectField.from_doc = function(doc){
	return new ui.SelectField(
		doc.name,
		doc.options,
		{
			class:   doc.class,
			label:   doc.label,
			tooltip: doc.tooltip,
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
			this.val(opts.default)
		}
	},
	_radio_changed: function(radio, checked){
		if(checked){
			this.selection = radio
			this.changed.notify(radio.value)
		}
	},
	val: function(value){
		if(value === undefined){
			if(this.selection){
				return this.selection.value
			}else{
				return null
			}
		}else{
			this.selection = this._radios.values[value] || null
			if(this.selection){
				this.selection.checked(true)
			}else{
				throw val + " not available in radio set (" + 
				      this._radios.values.keys().join(", ") + ")"
			}
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
		radio.changed.attach(this._radio_changed.bind(this))
	}
})
ui.RadioField.TYPE = "radio"
ui.Field.TYPES[ui.RadioField.TYPE] = ui.RadioField
ui.RadioField.from_doc = function(doc){
	var radios = []
	var radio_docs = doc.options || []
	for(var i=0;radio_docs.length;i++){
		var radio_doc = radio_docs[i]
		var radio = new ui.RadioField.Radio(
			radio_doc.label,
			radio_doc.value, 
			{
				class: radio_doc.class,
				tooltip: radio_doc.tooltip
			}
		)
		radios.push(radio)
	}
	return new ui.RadioField(
		doc.name,
		radios,
		{
			class:   doc.class,
			label:   doc.label,
			tooltip: doc.tooltip,
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
		
		if(opts.tooltip){
			this.node.attr('title', opts.tooltip)
		}
		if(opts.class){
			this.node.addClass(opts.class)
		}
		
		this._radio = {
			node: $("<input>")
				.attr('type', "radio")
				.change(this._changed.bind(this))
		}
		this.node.append(this._radio.node)
		
		this._label = {
			node: $("<label>")
				.text(label)
		}
		this.node.append(this._label.node)
		
		this.changed = new Event(this)
	},
	set_name: function(name){
		this.id = name + "_" + this.value
		
		this._radio.node.attr('name', name)
		this._radio.node.attr('id', this.id)
		this._label.node.attr('for', this.id)
	},
	disabled: function(disabled){
		if(disabled === undefined){
			return this.node.hasClass("disabled")
		}else{
			if(disabled){
				this.node.addClass("disabled")
				this._radio.node.attr('disabled', true)
			}else{
				this.node.removeClass("disabled")
				this._radio.node.removeAttr('disabled')
			}
		}
	},
	checked: function(checked){
		if(checked === undefined){
			return this._radio.node.is(":checked")
		}else{
			if(checked){
				this._radio.node.attr('checked', "checked")
			}else{
				this._radio.node.removeAttr('checked')
			}
		}
	},
	_changed: function(e){
		if(this.checked()){
			this.node.addClass("checked")
		}else{
			this.node.removeClass("checked")
		}
		
		//notify of change
		this.changed.notify(this.checked())
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
				.keydown(this._key_pressed.bind(this))
		}
		this.node.append(this._input.node)
		
		this.key_pressed = new Event(this)
		
		if(opts.default){
			this.val(opts.default)
		}
	},
	_key_pressed: function(e){
		this.key_pressed.notify(e.keyCode)
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
ui.TextField.from_doc = function(doc){
	return new ui.TextField(
		doc.name,
		{
			class:   doc.class,
			label:   doc.label,
			tooltip: doc.tooltip,
			default: doc.default
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
				.keydown(this._key_pressed.bind(this))
		}
		this.node.append(this._textarea.node)
		
		this.key_pressed = new Event(this)
		
		if(opts.default){
			this.val(opts.default)
		}
	},
	_key_pressed: function(e){
		this.key_pressed.notify(e.keyCode)
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
ui.TextareaField.from_doc = function(doc){
	return new ui.TextareaField(
		doc.name,
		{
			class:   doc.class,
			label:   doc.label,
			tooltip: doc.tooltip,
			default: doc.default
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
				.change(this._changed.bind(this))
				
		}
		this.node.prepend(this._input.node) //Prepended to get in front of the label.
		
		this.checked(opts.default)
	},
	_changed: function(e){
		if(this.checked()){
			this.node.addClass("checked")
		}else{
			this.node.removeClass("checked")
		}
		this.changed.notify(this.checked())
	},
	val: function(value){
		if(value === undefined){
			return this.checkbox.node.is(":checked")
		}else{
			if(value){
				this.checkbox.node.attr("checked", "checked")
			}else{
				this.checkbox.node.removeAttr("checked")
			}
		}
	},
	disabled: function(disabled){
		if(disabled === undefined){
			return this.node.hasClass("disabled")
		}else{
			if(disabled){
				this.node.addClass("disabled")
				this.checkbox.node.attr('disabled', true)
			}else{
				this.node.removeClass("disabled")
				this.checkbox.node.removeAttr('disabled')
			}
		}
	},
	focus: function(){
		this._input.node.focus()
	}
})
ui.CheckField.TYPE = "textarea"
ui.Field.TYPES[ui.CheckField.TYPE] = ui.CheckField
ui.CheckField.from_doc = function(doc){
	return new ui.CheckField(
		doc.name,
		{
			class:   doc.class,
			label:   doc.label,
			tooltip: doc.tooltip,
			default: doc.default
		}
	)
}
