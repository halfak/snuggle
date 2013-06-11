import sys, os, random

sys.path.append(os.path.dirname(__file__))

# get into our directory
os.chdir(os.path.dirname(__file__))

# load the server code
from snuggle import configuration
from snuggle.web import server #Load the application

# load configuration
configuration.snuggle.load_yaml(open("config/snuggle.yaml"))
configuration.mediawiki.load_yaml(open("config/enwiki.mediawiki.yaml"))
configuration.i18n.load_yaml(open("config/en-us.i18n.yaml"))

#start the application
application, _ = server.application(configuration) # Note: This config file must be set
