import sys

# update the path so we can do some imports. 
sys.path = ['/var/www/halfak/snuggle'] + sys.path

# get into our directory
os.chdir(os.path.dirname(__file__))

#load the server code
from snuggle.api import server #Load the application

#start the application
app = server.app(server.config("config/config.json")) #Note: This config file must be set