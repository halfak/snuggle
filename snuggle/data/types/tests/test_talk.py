from nose.tools import eq_

from ..talk import Talk, Topic

def test_topic():
	title = "I am a title"
	classes = [
		"vandalism",
		"level_1"
	]
	
	topic = Topic(title, classes)
	
	eq_(topic.title, title)
	eq_(topic.classes, classes)
	
	eq_(topic, Topic.inflate(topic.deflate()))
	

def test_talk():
	last_id = 3456789
	topics = [
		Topic("I am a title", ["vandalism", "level_1"]),
		Topic("Welcome to Wikipedia!", ["welcome"])
	]
	
	talk = Talk(last_id, topics)
	
	eq_(talk.last_id, last_id)
	eq_(topics, topics)
	
	eq_(talk, Talk.inflate(talk.deflate()))