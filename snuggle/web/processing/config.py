
from snuggle import configuration
from snuggle.web.util import responses

class Config:
	
	def language(self):
		#configuration.language should be ready by this point
		return responses.js_variable("LANGUAGE", configuration.language)
	
	def mediawiki(self):
		#configuration.mediawiki should be ready by this point
		return responses.js_variable("MEDIAWIKI", configuration.mediawiki)
		
	
	
