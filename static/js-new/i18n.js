i18n = {
	get: function(key){
		if(configuration.i18n[key] === undefined){
			return "[" + key + "]"
		}else{
			return configuration.i18n[key]
		}
	}
}
