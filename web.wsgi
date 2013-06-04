import sys, os

# update the path so we can do some imports. 
sys.path = ['/sites/snuggle'] + sys.path

# get into our directory
os.chdir(os.path.dirname(__file__))

# load the server code
from snuggle import configuration
from snuggle.web import server #Load the application

# load configuration
configuration.snuggle.load_yaml(open("config/snuggle.dev"))
configuration.mediawiki.load_yaml(open("config/enwiki.mediawiki.dev"))

#start the application
app = server.app(configuration) #Note: This config file must be set