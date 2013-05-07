import yaml

#To do: Don't hard code actions comments.
LANGUAGE = {

}

def load_config(doc):
	LANGUAGE.update(doc)

def get(name):
	keys = name.split(".")
	
	try:
		val = LANGUAGE
		for key in keys:
			val = val[key]
		
		return unicode(val)
	except KeyError:
		return u"[name]"
	
