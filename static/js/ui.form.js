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
			label : string
				the label to be used for the field
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
		
		this.key_pressed = new Event(this)
		this.node.keydown(function(e){this.key_pressed.notify(e.keyCode)}.bind(this))
		
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
