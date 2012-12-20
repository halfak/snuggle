window.system = {
	api: new WikipediaAPI(config.wiki_root + "/w/api.php")
}

System = Class.extend({
	init: function(creds, api, server){
		this.ui = new UI()
	},
	loadWhenReady: function(){
		$(document).ready(this.load.bind(this))
	},
	load: function(){
		//Append UI element
		$('html').append(this.ui.node)
		
		//Set status to loading
		
	}
})
