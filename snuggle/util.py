import importlib

def import_class(path):
	modules = path.split(".")
	
	try:
		if len(modules) == 1:
			return importlib.import_module(modules[0])
		else:
			module = importlib.import_module(".".join(modules[:-1]))
			return getattr(module, modules[-1])
	
	except ImportError as e:
		raise ImportError(str(e) + "(%s)" % path)
