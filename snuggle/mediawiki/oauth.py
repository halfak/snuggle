import os

import mwoauth
import yaml


class OAuth(mwoauth.Handshaker):
	
	@classmethod
	def from_config(cls, config):
		
		oauth_config = yaml.load(open(
			os.path.join(
				config.snuggle['root_directory'],
				config.snuggle['oauth_config']
			)
		))
		
		consumer_token = mwoauth.ConsumerToken(
			oauth_config['consumer_key'],
			oauth_config['consumer_secret']
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
