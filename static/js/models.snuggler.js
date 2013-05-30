models = window.models || {}

/**
Represents the current snuggle user's status.
*/
models.Snuggler = Class.extend({
		
	/** */
	init: function(){
		this.user = null
		this.changed = new Event(this)
	},
	
	/**
	Sets the credentials (usually after login).
		
	:Parameters:
		id : int
			Wikipedia user identifier
		name : string
			Wikipedia username
	*/
	load_doc: function(doc){
		logger.debug("Loading information for snuggler " + JSON.stringify(doc))
		this.user = {
			id: doc.id,
			name: doc.name
		}
		this.changed.notify(this.user)
	},
	
	/**
	Clears the credentials (usually after logging out.
	*/
	clear: function(){
		this.user = null
		this.changed.notify(this.user)
	}
})
