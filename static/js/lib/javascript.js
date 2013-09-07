String.prototype.format = function(doc) {
	var str = this;
	var i = 0;
	var len = arguments.length;
	return str.replace(
		/%\(([^\)]+)\)s/g,
		function(match, name){
			return doc[name] || "[" + name + " undefined]"
		}
	)
}


Object.defineProperty(Array.prototype, 'max',{
	value: function(){
		if(this.length == 0){
			throw new Error("Cannot find maximum of an empty list")
		}
		var maximum = null
		for(var i in this){
			if(this[i] > maximum){
				maximum = this[i]
			}
		}
		return maximum
	},
	writable: true,
	configurable: true,
	enumerable: false
})

Object.defineProperty(Array.prototype, 'group',{
	value: function(by){
		/*
		Groups the values of the array by the provided `by` function and returns
		an object mapping the keys to arrays of the grouped values.
		
		:Parameters:
			by : function
				a grouping function -- takes an element and returns the key to group over
		*/
		by = by || function(item){return item}
			
		var groups = new Object()
		
		for(var i in this){
			var item = this[i]
			var key   = by(item)
			if(groups[key]){
				groups[key].push(item)
			}else{
				groups[key] = [item]
			}
		}
		
		return groups
	},
	writable: true,
	configurable: true,
	enumerable: false
})

Object.defineProperty(Object.prototype, 'keys',{
	value: function(){
		/*
		Groups the values of the array by the provided `by` function and returns
		an object mapping the keys to arrays of the grouped values.
		
		:Parameters:
			by : function
				a grouping function -- takes an element and returns the key to group over
		*/
		var keys = []
		
		for(var key in this){
			if(this.hasOwnProperty(key)){
				keys.push(key)
			}
		}
		
		return keys
	},
	writable: true,
	configurable: true,
	enumerable: false
})

Object.defineProperty(Object.prototype, 'values',{
	value: function(){
		var values = []
		
		for(var key in this){
			if(this.hasOwnProperty(key)){
				values.push(this[key])
			}
		}
		
		return values
	},
	writable: true,
	configurable: true,
	enumerable: false
})

jQuery.extend(
  jQuery.expr[ ":" ], 
  { reallyvisible : function (a) { return !(jQuery(a).is(':hidden') || jQuery(a).parents(':hidden').length); }}
);
