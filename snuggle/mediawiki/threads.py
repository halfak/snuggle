from snuggle.data import types

from .util import parsing, templates

def parse(markup):
	threads = []
	for title, section_markup in parsing.sections(markup):
		threads.append(
			types.Thread(
				parsing.clean_header(title), 
				templates.classes(section_markup)
			)
		)
	return threads