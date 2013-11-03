sudo apt-get install python-numpy python-scipy mercurial \
     python-pip build-essential libmysqlclient-dev nano mongodb apache2 \
     libapache2-mod-wsgi screen;
sudo pip install oursql bottle beaker pymongo cherrypy pyyaml slimit nosetests;

# Need to use an old version to get around a weird bug related to edit tokens
sudo pip install requests==0.14.2;


