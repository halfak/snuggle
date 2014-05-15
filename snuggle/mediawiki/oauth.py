import mwoauth

class OAuth(mwoauth.Handshaker):
	
	@classmethod
	def from_config(cls, config):
		
		consumer_token = mwoauth.ConsumerToken(
			config.snuggle['oauth']['consumer_key'],
			config.snuggle['oauth']['consumer_secret']
		)
		return cls(
			"%s://%s%s%s" % (
				config.mediawiki['protocol'],
				config.mediawiki['domain'],
				config.mediawiki['path']['scripts'],
				config.mediawiki['file']['index']
			),
			consumer_token
		)
	
