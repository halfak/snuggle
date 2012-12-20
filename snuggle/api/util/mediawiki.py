import requests

def init(config):
	global authentication
	authentication = Authentication(cfg['mediawiki']['api_url'])

class Authentication: pass



