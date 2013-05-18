from nose.tools import eq_

from ..talk import Talk, Thread

def test_thread():
	title = "I am a title"
	classes = [
		"vandalism",
		"level_1"
	]
	
	thread = Thread(title, classes)
	
	eq_(thread.title, title)
	eq_(thread.classes, classes)
	
	eq_(thread, Thread.deserialize(thread.serialize()))
	

def test_talk():
	last_id = 3456789
	threads = [
		Thread("I am a title", ["vandalism", "level_1"]),
		Thread("Welcome to Wikipedia!", ["welcome"])
	]
	
	talk = Talk(last_id, threads)
	
	eq_(talk.last_id, last_id)
	eq_(talk.threads, threads)
	
	eq_(talk, Talk.deserialize(talk.serialize()))