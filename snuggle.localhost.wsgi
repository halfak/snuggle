import os
import random
import sys

try:
    # get into our directory
    os.chdir(os.path.dirname(__file__))

    sys.path.append(os.path.dirname(__file__))

    from snuggle import configuration
    from snuggle.web import server  # Load the application
except:
    raise


# load the server code

# load configuration
configuration.snuggle.load_yaml(open("config/snuggle.localhost.yaml"))
configuration.mediawiki.load_yaml(open("config/enwiki.mediawiki.yaml"))
configuration.i18n.load_yaml(open("config/en-us.i18n.yaml"))

#start the application
application, _ = server.application(configuration) # Note: This config file must be set
