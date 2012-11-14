import sys, os, bottle

# update the path so we can do some imports. 
sys.path = ['/var/www/halfak/snuggle/web/server'] + sys.path

# get into our directory
os.chdir(os.path.dirname(__file__))

#load the server code
import server #Load the application

#start the application
application = bottle.default_app()