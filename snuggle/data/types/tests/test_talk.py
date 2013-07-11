from nose.tools import eq_

from ..talk import Talk, Thread, Trace


def test_trace():
	name = u"Vandalism"
	modifications = {
		'superscript': "foo"
	}
	
	trace = Trace(name, modifications)
	
	eq_(trace.name, name)
	eq_(trace.modifications, modifications)
	
	eq_(trace, Trace.deserialize(trace.serialize()))
	
	
def test_thread():
	title = "I am a title"
	trace = Trace("Foo", {})
	
	thread = Thread(title, trace)
	
	eq_(thread.title, title)
	eq_(thread.trace, trace)
	
	eq_(thread, Thread.deserialize(thread.serialize()))
	

def test_talk():
	last_id = 3456789
	threads = [
		Thread("I am a title", Trace("vandal warning")),
		Thread("Welcome to Wikipedia!", Trace("welcome"))
	]
	
	talk = Talk(last_id, threads)
	
	eq_(talk.last_id, last_id)
	eq_(talk.threads, threads)
	
	eq_(talk, Talk.deserialize(talk.serialize()))