UI = window.UI || {}

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

UI.RadioSet = Class.extend({
	/**
	:Parameters:
		value : <mixed>
			The value to associate with this radio button
		opts : object
			name : string
				a name to be used for the associated radio buttons
			label : string
				a label to associate with the field
			title : string
				a tooltip for the field
			class : string
				a classname to add to the node
	
	*/
	init: function(opts){
		opts = opts || {}
		
		this.node = $("<div>")
			.addClass("input_field")
			.addClass("radio_set")
		
		this.name = opts.name || "radio_set_" + new Date().getTime()
		
		
		this.label = {
			node: $("<label>")
				.append(opts.label || '')
		}
		this.node.append(this.label.node)
			
		this.radios = {
			node: $("<div>")
				.addClass("radios"),
			map: {}
		}
		this.node.append(this.radios.node)
		
		this.changed = new Event(this)
		
		this.selection = null
		
		if(opts.title){
			this.node.attr("title", opts.title)
		}
		if(opts.class){
			this.node.addClass(opts.class)
		}
	},
	val: function(val){
		if(val === undefined){
			if(this.selection){
				return this.selection.value
			}else{
				return null
			}
		}else{
			this.selection = this.radios.map[val] || null
			if(this.selection){
				this.radios.map[val].checked(true)
			}else{
				throw val + " not available in radio set (" + 
				      this.radios.map.keys().join(", ") + ")"
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
			this.radios.map.values().map(function(radio){radio.disabled(disabled)})
		}
	},
	append: function(radio){
		radio.set_name(this.name)
		this.radios.node.append(radio.node)
		this.radios.map[radio.value] = radio
		radio.changed.attach(this._radio_changed.bind(this))
	},
	_radio_changed: function(radio, checked){
		if(checked){
			this.selection = radio
			this.changed.notify(radio.value)
		}
	}
})


UI.Radio = Class.extend({
	/**
	:Parameters:
		value : <mixed>
			The value to associate with this radio button
		opts : object
			checked : boolean
				checked by default?
			label : string
				a label to associate with the field (defaults to value)
			title : string
				a tooltip for the field
			class : string
				a classname to add to the node
	
	*/
	init: function(value, opts){
		opts = opts || {}
		this.value = value
		
		this.node = $("<div>")
			.addClass("input_field")
			.addClass("radio")
		
		id = value + "_" + new Date().getTime()
		
		this.button = {
			node: $("<input>")
				.attr('type', "radio")
				.attr('id', id)
				.change(this._changed.bind(this))
		}
		this.node.append(this.button.node)
		
		this.label = {
			node: $("<label>")
				.attr('for', id)
				.text(opts.label || value)
		}
		this.node.append(this.label.node)
		
		this.changed = new Event(this)
		
		
		if(opts.title){
			this.node.attr("title", opts.title)
		}
		if(opts.class){
			this.node.addClass(opts.class)
		}
		this.checked(opts.checked)
	},
	set_name: function(name){
		this.button.node.attr('name', name)
	},
	disabled: function(disabled){
		if(disabled === undefined){
			return this.node.hasClass("disabled")
		}else{
			if(disabled){
				this.node.addClass("disabled")
				this.button.node.attr('disabled', true)
			}else{
				this.node.removeClass("disabled")
				this.button.node.removeAttr('disabled')
			}
		}
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

UI.TextField = Class.extend({
	/**
	:Parameters:
		opts : object
			password : boolean
				should the field hide the characters like a password
			label : string
				the label to be used for the field
			title : string
				a tooltip for the field
			class : string
				a classname to add to the node
	*/
	init: function(opts){
		opts = opts || {}
		this.node = $("<div>")
			.addClass("input_field")
			.addClass("text")
			
		if(opts.title){
			this.node.attr("title", title)
		}
		if(opts.class){
			this.node.addClass(opts.class)
		}
		
		var id = "text_field_" + new Date().getTime()
		
		this.label = {
			node: $("<label>")
				.attr('for', id)
				.append(opts.label || '')
		}
		this.node.append(this.label.node)
		
		this.input = {
			node: $("<input>")
				.attr('id', id)
				.attr('type', opts.password ? "password" : "text")
				.keydown(this._key_pressed.bind(this))
		}
		this.node.append(this.input.node)
		
		this.key_pressed = new Event(this)
		this.changed = new Event(this)
	},
	_key_pressed: function(e){
		this.key_pressed.notify(e.keyCode)
		this.changed.notify()
	},
	val: function(val){
		if(val === undefined){
			return this.input.node.val()
		}else{
			this.input.node.val(val)
		}
	},
	disabled: function(disabled){
		if(disabled === undefined){
			return this.node.hasClass("disabled")
		}else{
			if(disabled){
				this.node.addClass("disabled")
				this.input.node.attr('disabled', true)
			}else{
				this.node.removeClass("disabled")
				this.input.node.removeAttr('disabled')
			}
		}
	},
	focus: function(){
		this.input.node.focus()
	}
})

UI.TextareaField = Class.extend({
	/**
	:Parameters:
		opts : object
			label : string
				the label to be used for the field
			title : string
				a tooltip for the field
			class : string
				a classname to add to the node
	*/
	init: function(opts){
		opts = opts || {}
		
		this.node = $("<div>")
			.addClass("input_field")
			.addClass("textarea")
			
		if(opts.title){
			this.node.attr("title", title)
		}
		if(opts.class){
			this.node.addClass(opts.class)
		}
		
		var id = "textarea_field_" + new Date().getTime()
		
		this.label = {
			node: $("<label>")
				.attr('for', id)
				.append(opts.label || '')
		}
		this.node.append(this.label.node)
		
		this.textarea = {
			node: $("<textarea>")
				.attr('id', id)
				.keydown(this._key_pressed.bind(this))
		}
		this.node.append(this.textarea.node)
		
		this.key_pressed = new Event(this)
		this.changed = new Event(this)
	},
	_key_pressed: function(e){
		this.key_pressed.notify(e.keyCode)
		this.changed.notify()
	},
	val: function(val){
		if(val === undefined){
			return this.textarea.node.val()
		}else{
			this.textarea.node.val(val)
		}
	},
	disabled: function(disabled){
		if(disabled === undefined){
			return this.node.hasClass("disabled")
		}else{
			if(disabled){
				this.node.addClass("disabled")
				this.textarea.node.attr('disabled', true)
			}else{
				this.node.removeClass("disabled")
				this.textarea.node.removeAttr('disabled')
			}
		}
	},
	focus: function(){
		this.input.node.focus()
	}
})

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
	init: function(value, opts){
		this.value = value
		opts = opts || {}
		
		this.node = $("<div>")
			.addClass("input_field")
			.addClass("check")
		
		
		var id = "check_field_" + new Date().getTime()
		
		this.checkbox = {
			node: $("<input>")
				.attr('id', id)
				.attr('type', "checkbox")
				.change(this._changed.bind(this))
				
		}
		this.node.append(this.checkbox.node)
		
		this.label = {
			node: $("<label>")
				.attr('for', id)
				.append(opts.label || '')
		}
		this.node.append(this.label.node)
		
		this.changed = new Event(this)
		
		if(opts.title){
			this.node.attr("title", opts.title)
		}
		if(opts.class){
			this.node.addClass(opts.class)
		}
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
	checked: function(checked){
		if(checked === undefined){
			return this.checkbox.node.is(":checked")
		}else{
			if(checked){
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
		this.input.node.focus()
	}
})
