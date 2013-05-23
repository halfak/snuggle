UI = window.UI || {}

UI.Field = Class.extend({
	init: function(id, name, opts){
		opts = opts || {}'
		
		this.id   = id
		this.name = name
		
		this.node = $("<div>")
			.addClass("input_field")
		
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
			
			if(opts.title){
				this._label.node.attr("title", opts.title)
			}
		}
		
		this.changed = new Event(this) //This may not work.  
	},
	_changed: function(e){
		this.changed.notify()
	},
})

UI.SelectField = UI.Field.extend({
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
			return this.values[label]
		}else{
			var label = this.labels[value]
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
		for(var label=0;i<options.length;i++){
			var option = options[i]
			var label = String(option.label || option.value)
			this._select.values[label] = option.value
			this._select.labels[option.value] = label
			
			this._select.node.append(
				$("<option>")
					.attr('value', label)
					.text(label)
			)
		}
	}
})
UI.SelectField.TYPE = "select"
UI.Field.TYPES[UI.SelectField.TYPE] = UI.SelectField

UI.RadioField = UI.Field.extend({
	init: function(name, radios, opts){
		opts = opts || {}
		
		var id = opts.id || "radio_field_" + new Date().getTime()
		
		this._super(id, name, opts)
		
		this.node.addClass("radio")
			
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
UI.RadioField.TYPE = "radio"
UI.Field.TYPES[UI.RadioField.TYPE] = UI.RadioField


UI.RadioField.Radio = Class.extend({
	init: function(label, value, opts){
		opts = opts || {}
		
		this.label = label
		this.value = value
		
		this.node = $("<div>")
			.addClass("radio_option")
		
		if(opts.title){
			this.node.attr('title', opts.title)
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

UI.TextField = UI.Field.extend({
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
UI.TextField.TYPE = "text"
UI.Field.TYPES[UI.TextField.TYPE] = UI.TextField

UI.TextareaField = UI.Field.extend({
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
UI.TextareaField.TYPE = "textarea"
UI.Field.TYPES[UI.TextareaField.TYPE] = UI.TextareaField

UI.CheckField = Class.extend({
	/**
	:Parameters:
		opts : object
			checked : boolean
				checked by default?
			label : string
				the label to be used for the field
			title : string
				tooltip text for this field
			class : string
				a classname to add to the node
	*/
	init: function(name, opts){
		opts = opts || {}
		
		var id = "check_field_" + new Date().getTime()
		
		this._super(id, name, opts)
		
		this.node.addClass("check")
		
		this._input = {
			node: $("<input>")
				.attr('id', id)
				.attr('type', "checkbox")
				.change(this._changed.bind(this))
				
		}
		this.node.prepend(this._input.node) //Prepended to get in front of the label.
		
		this.checked(opts.checked)
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
UI.CheckField.TYPE = "textarea"
UI.Field.TYPES[UI.CheckField.TYPE] = UI.CheckField
