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
	init: function(opts){
		opts = opts || {}
		
		this.node = $("<div>")
			.addClass("radio_set")
		
		this.name = opts.name || "radio_set_" + new Date().getTime()
		
		if(opts.label){
			this.label = {
				node: $("<label>")
					.append(opts.label || '')
			}
			this.node.append(this.label.node)
		}
			
		this.radios = {
			node: $("<div>")
				.addClass("radios"),
			map: {}
		}
		this.node.append(this.radios.node)
		
		this.changed = new Event(this)
		
		this.selection = null
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
				this.radios.map[val].val(true)
			}else{
				throw val + " not available in radio set (" + 
				      this.radios.map.keys().join(", ") + ")"
			}
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
			this.changed.notify(value)
		}
	}
})


UI.Radio = Class.extend({
	init: function(value, opts){
		this._super(this)
		
		opts = opts || {}
		this.value = value
		
		this.node = $("<div>")
			.addClass("radio")
		
		id = value + "_" + new Date().getTime()
		
		this.button = {
			node: $("<input>")
				.attr('type', "radio")
				.attr('id', id)
				.change(this._handle_change.bind(this))
		}
		this.node.append(this.button.node)
		
		this.label = {
			node: $("<label>")
				.attr('for', id)
				.text(opts.label || opts.value)
		}
		this.node.append(this.label.node)
		
		this.changed = new Event(this)
		this.status = false
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
	selected: function(selected){
		if(selected === undefined){
			return this.status
		}else{
			if(selected){
				this.button.node.attr('checked', "checked")
			}else{
				this.button.node.removeAttr('checked', "checked")
			}
		}
	},
	_update_status: function(checked){
		this.status = Boolean(checked)
		if(this.status){
			this.node.addClass("selected")
		}else{
			this.node.removeClass("selected")
		}
	},
	_handle_change: function(e){
		//update status
		this._update_status(this.button.node.is(":checked"))
		
		//notify of change
		this.changed.notify(this.selected())
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
				.attr('for', id)
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
