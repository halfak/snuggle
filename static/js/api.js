API = Class.extend({
	init: function(url, timeout){
		this.url = url
		this.timeout = timeout
	},
	/**
	 * Sends a request to the API and handles the response
	 *
	 * @param data A map of request parameters to send to the API
	 * @param type The type of request to make (commonly POST or GET)
	 * @param success A function to call with response information upon a successful interaction
	 * @param error A function to call when an error occurred
	 */
	request: function(data, type, success, error){
		request = {
			url: this.url,
			timeout: this.timeout,
			dataType: "json",
			data: data,
			success: success,
			error: function(jqXHR, status, exception){
				//Sometimes an error happens when the request is 
				//interrupted by the user changing pages. 
				error("The API could not be reached: " + jqXHR.status + ": " + exception)
			}.bind(this)
		}
		switch(type){
			case "POST":
				request.type = "POST"
				request.dataType = "json"
				break
			case "GET":
				request.type = "GET"
				request.dataType = "json"
				break
			case "jsonp":
				request.type = "GET"
				request.dataType = "jsonp"
		}
		$.ajax(request)
	},
	/**
	 * Convenience function for initiating a POST request: e.g. request(data, "POST", success, error)
	 *
	 * @param data A map of request parameters to send to the API
	 * @param success A function to call with response information upon a successful interaction
	 * @param error A function to call when an error occurred
	 */
	post: function(data, success, error){
		return this.request(data, "POST", success, error)
	},
	/**
	 * Convenience function for initiating a GET request: e.g. request(data, "GET", success, error)
	 *
	 * @param data A map of request parameters to send to the API
	 * @param success A function to call with response information upon a successful interaction
	 * @param error A function to call when an error occurred
	 */
	get: function(data, success, error){
		return this.request(data, "GET", success, error)
	},
	/**
	 * Convenience function for initiating a GET request via jsonp. e.g. request(data, "jsonp", success, error)
	 *
	 * @param data A map of request parameters to send to the API
	 * @param success A function to call with response information upon a successful interaction
	 * @param error A function to call when an error occurred
	 */
	jsonp: function(data, success, error){
		return this.request(data, "jsonp", success, error)
	},
	
})

/**
Represents the mediawiki API
*/
MWAPI = API.extend({
	
	/**
	See API.request()
	*/
	request: function(data, type, success, error){
		data.format="json"
		this._super(
			data,
			type,
			function(doc){ //success
				if(doc.error){
					error(doc.error.code + ": " + doc.error.info)
				}else{
					success(doc)
				}
			}.bind(this),
			error
		)
	}
})



/**
Represents the local server's api.
*/
LocalAPI = API.extend({
	/**
	See API.request()
	*/
	request: function(object, action, data, type, success, error){
		if(data){
			data = JSON.stringify(data)
		}else{
			data = ''
		}
		
		request = {
			timeout: this.timeout,
			dataType: "json",
			success: function(doc){
				if(!doc.success){
					if(doc.error){
						error(doc.error.code + ": " + doc.error.message, doc.error, doc.meta)
					}else{
						error("Unknown response format.")
						LOGGING.error(doc)
					}
				}else{
					success(doc.success)
				}
			}.bind(this),
			error: function(jqXHR, status, exception){
				//Sometimes an error happens when the request is 
				//interrupted by the user changing pages. 
				error("The API could not be reached: " + jqXHR.status + ": " + exception || status)
			}.bind(this)
		}
		switch(type){
			case "POST":
				request.type = "POST"
				request.url = this.url + "/" + object + "/" + action + "/"
				request.data = data
				request.dataType = "json"
				break
			case "GET":
				request.type = "GET"
				request.url = this.url + "/" + object + "/" + action + "/" + data
				request.dataType = "json"
				break
			case "jsonp":
				request.type = "GET"
				request.url = this.url + "/" + object + "/" + action + "/" + data
				request.dataType = "jsonp"
				break
		}
		$.ajax(request)
	},
	
	/**
	*/
	post: function(object, action, data, success, error){
		this.request(object, action, data, "POST", success, error)
	},
	
	/**
	*/
	get: function(object, action, data, success, error){
		this.request(object, action, data, "GET", success, error)
	},
	
	/**
	*/
	jsonp: function(object, action, data, success, error){
		this.request(object, action, data, "jsonp", success, error)
	}
	
})
