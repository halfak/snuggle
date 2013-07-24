import logging, StringIO, slimit

class Script:
	def __init__(self, processor):
		self.processor = processor
		self.stored    = None
		
	def compressed(self):
		if self.stored == None:
			sstream = StringIO.StringIO() 
			sstream.write(self.processor.read("js/lib/jquery-1.10.2.min.js"))
			sstream.write(self.processor.read("js/lib/class.js"))
			sstream.write(self.processor.read("js/lib/date.format.js"))
			sstream.write(self.processor.read("js/lib/javascript.js"))
			sstream.write(self.processor.read("js/env.js"))
			sstream.write(self.processor.read("js/util.js"))
			sstream.write(self.processor.read("js/i18n.js"))
			sstream.write(self.processor.read("js/api.js"))
			sstream.write(self.processor.read("js/servers.js"))
			sstream.write(self.processor.read("js/event.js"))
			sstream.write(self.processor.read("js/logging.js"))
			sstream.write(self.processor.read("js/ui.button.js"))
			sstream.write(self.processor.read("js/ui.element.js"))
			sstream.write(self.processor.read("js/ui.dropper.js"))
			sstream.write(self.processor.read("js/ui.fields.js"))
			sstream.write(self.processor.read("js/ui.definition_list.js"))
			sstream.write(self.processor.read("js/ui.edit_counts.js"))
			sstream.write(self.processor.read("js/ui.utc.js"))
			sstream.write(self.processor.read("js/ui.revision_graph.js"))
			sstream.write(self.processor.read("js/ui.action_menu.js"))
			sstream.write(self.processor.read("js/ui.help.js"))
			sstream.write(self.processor.read("js/ui.snuggle.js"))
			sstream.write(self.processor.read("js/ui.system_status.js"))
			sstream.write(self.processor.read("js/ui.event.js"))
			sstream.write(self.processor.read("js/ui.event_list.js"))
			sstream.write(self.processor.read("js/ui.event_filters.js"))
			sstream.write(self.processor.read("js/ui.event_browser.js"))
			sstream.write(self.processor.read("js/ui.user.js"))
			sstream.write(self.processor.read("js/ui.user.model.js"))
			sstream.write(self.processor.read("js/ui.user.view.js"))
			sstream.write(self.processor.read("js/ui.user_filters.js"))
			sstream.write(self.processor.read("js/ui.user_list.js"))
			sstream.write(self.processor.read("js/ui.user_browser.js"))
			sstream.write(self.processor.read("js/ui.user_container.js"))
			sstream.write(self.processor.read("js/ui.welcome.js"))
			sstream.write(self.processor.read("js/ui.snuggler.js"))
			
			self.stored = sstream.getvalue()
		
		return self.stored
