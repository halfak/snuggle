import logging, StringIO, sys

class Style:
	def __init__(self, processor):
		self.processor = processor
		self.stored    = None
		
	def compressed(self):
		if self.stored == None:
			sstream = StringIO.StringIO()
			sstream.write(self.processor.read("css/main.css"))
			sstream.write(self.processor.read("css/border_box.css"))
			sstream.write(self.processor.read("css/categories.css"))
			sstream.write(self.processor.read("css/document.css"))
			sstream.write(self.processor.read("css/layout.css"))
			sstream.write(self.processor.read("css/revisions.css"))
			sstream.write(self.processor.read("css/threads.css"))
			sstream.write(self.processor.read("css/wiki_format.css"))
			
			sstream.write(self.processor.read("css/ui.snuggle.css"))
			sstream.write(self.processor.read("css/ui.element.css"))
			sstream.write(self.processor.read("css/ui.button.css"))
			sstream.write(self.processor.read("css/ui.fields.css"))
			sstream.write(self.processor.read("css/ui.dropper.css"))
			sstream.write(self.processor.read("css/ui.action_menu.css"))
			sstream.write(self.processor.read("css/ui.help.css"))
			sstream.write(self.processor.read("css/ui.revision_graph.css"))
			sstream.write(self.processor.read("css/ui.snuggler.css"))
			sstream.write(self.processor.read("css/ui.welcome.css"))
			sstream.write(self.processor.read("css/ui.user_container.css"))
			sstream.write(self.processor.read("css/ui.event.css"))
			sstream.write(self.processor.read("css/ui.event_filters.css"))
			sstream.write(self.processor.read("css/ui.event_list.css"))
			sstream.write(self.processor.read("css/ui.event_browser.css"))
			sstream.write(self.processor.read("css/ui.categorizer.css"))
			sstream.write(self.processor.read("css/ui.user.css"))
			sstream.write(self.processor.read("css/ui.user_filters.css"))
			sstream.write(self.processor.read("css/ui.user_list.css"))
			sstream.write(self.processor.read("css/ui.user_browser.css"))
			
			
			self.stored = sstream.getvalue()
		
		return self.stored
