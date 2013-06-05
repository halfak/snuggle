/** 
Implements a simple event-listener system.  Agents can recieve notifications by
attach()ing callbacks.  Notifcations can then be sent to all callbacks using 
notify().
*/
Event = Class.extend({
	init: function(source){
		this.source = source
		this.listeners = []
	},
	attach: function(callback){
		this.listeners.push(callback)
	},
	notify: function(){
		arguments = Array.prototype.slice.call(arguments)
		arguments.unshift(this.source)
		for(var i=0;i<this.listeners.length;i++){
			this.listeners[i].apply(this.source, arguments)
		}
	}
})



