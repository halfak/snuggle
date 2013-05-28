models = window.models || {}

/**
Represents the current snuggle user's status.
*/
models.Snuggler = Class.extend({
		
	/** */
	init: function(){
		this.user = null
		this.changed = new Event(this)
	}
	
	/**
	Sets the credentials (usually after login).
		
	:Parameters:
		id : int
			Wikipedia user identifier
		name : string
			Wikipedia username
	*/
	set: function(id, name){
		this.user = {
			id: id,
			name: name
		}
		this.changed.notify(this.creds)
	},
	
	/**
	Clears the credentials (usually after logging out.
	*/
	clear: function(){
		this.user = null
		this.changed.notify(this.creds)
	}
})
