
/**
 * Simplifies use of a MediaWiki API by offering a few convenience functions
 * and common error handling.
 */
MediaWikiAPI = Class.extend({
	/**
	 * Constructor
	 * 
	 * @param uri The uri to call to access the API
	 */
	init: function(uri, prefix){
		this.uri    = uri
		this.prefix = prefix || ""
	},
	/**
	 * Sends a request to the API and handles the response
	 *
	 * @param data A map of request parameters to send to the API
	 * @param type The type of request to make (commonly POST or GET)
	 * @param success A function to call with response information upon a successful interaction
	 * @param error A function to call when an error occurred
	 */
	request: function(data, type, success, error, opts){
		type = type || "GET"
		data.format="json"
		pdata = {}
		for(key in data){
			pdata[this.prefix + key] = data[key]
		}
		$.ajax(
			$.extend(
				{
					url: this.uri,
					dataType: "json",
					data: pdata,
					type: type,
					context: this,
					success: function(success, error){return function(json, status){
						if(status != "success"){
							error("The API could not be reached: " + status)
						}else if(json.error){
							error("Received an error from the API: " + json.error.code + " - " + json.error.info)
						}else{
							success(json)
						}
					}}(success, error),
					error: function(error){return function(jqXHR, status, message){
						//Sometimes an error happens when the request is 
						//interrupted by the user changing pages. 
						if(status != 'error' || message != ''){
							error("The API could not be reached: " + status + ": " + message)
						}
					}}(error)
				},
				opts || {}
			)
		)
	},
	/**
	 * Convenience function for initiating a POST request: e.g. request(data, "POST", success, error)
	 *
	 * @param data A map of request parameters to send to the API
	 * @param success A function to call with response information upon a successful interaction
	 * @param error A function to call when an error occurred
	 */
	post: function(data, success, error, opts){
		return this.request(data, "POST", success, error, opts)
	},
	/**
	 * Convenience function for initiating a GET request: e.g. request(data, "GET", success, error)
	 *
	 * @param data A map of request parameters to send to the API
	 * @param success A function to call with response information upon a successful interaction
	 * @param error A function to call when an error occurred
	 */
	get: function(data, success, error, opts){
		return this.request(data, "GET", success, error, opts)
	},
	/**
	 * Convenience function for initiating a GET request via jsonp. e.g. request(data, "jsonp", success, error)
	 *
	 * @param data A map of request parameters to send to the API
	 * @param success A function to call with response information upon a successful interaction
	 * @param error A function to call when an error occurred
	 */
	jsonp: function(data, success, error, opts){
		return this.request(data, "GET", success, error, $.extend({dataType: "jsonp"}, opts||{}))
	}
})

WikipediaAPI = MediaWikiAPI.extend({
	diff: function(id, success, error){
		this.jsonp(
			{
				action: "query",
				prop:   "revisions",
				revids: id,
				rvprop: "ids",
				rvdiffto: "prev",
				format: "json"
			},
			function(json){
				if(json.query){
					if(json.query.pages){
						var page = json.query.pages.values()[0]
						var revision = page.revisions[0]
						success(revision.revid, $(revision.diff['*']))
					}else if(json.query.badrevids){
						error("Could not find diff for revid=" + json.query.badrevids.values()[0]["revid"])
					}else{
						error("Unexpected response from the api: " + JSON.stringify(json))
					}
				}else{
					error("Unexpected response from the api: " + JSON.stringify(json))
				}
			}.bind(this),
			error,
			{
				cache: true,
				timeout: 5000
			}
		)
	}		
})

