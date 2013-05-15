from nose.tools import eq_

from ..action import SendMessage
from ..byte_diff import ByteDiff
from ..user import User
from ..page import Page
from ..revision import UserRevision
from ..event import Event, ServerStart, ServerStop, ViewUser, CategorizeUser, UserAction

def test_server_start():
	server = "web"
	server_start = ServerStart(server)
	
	eq_(server_start.server, server)
	
	eq_(server_start, Event.inflate(server_start.deflate()))

def test_server_stop():
	server = "web"
	start_time = 1234567890
	stats = {"foo": 5}
	error = "foobar"
	server_stop = ServerStop(server, start_time, stats, error)
	
	eq_(server_stop.server, server)
	eq_(server_stop.start_time, start_time)
	eq_(server_stop.stats, stats)
	eq_(server_stop.error, error)
	
	eq_(server_stop, Event.inflate(server_stop.deflate()))

def test_user_query():
	query = {'herp': 10, 'derp': "derpity"}
	wait_time = 1234567.76
	response_length = 6538
	snuggler = User(10, "Derp")
	data = {'more': "Derp"}
	user_query = UserQuery(query, wait_time, response_length, snuggler, data)
	
	eq_(user_query.query, query)
	eq_(user_query.wait_time, wait_time)
	eq_(user_query.response_length, response_length)
	eq_(user_query.snuggler, snuggler)
	eq_(user_query.data, data)
	
	eq_(user_query, Event.inflate(user_query.deflate()))

def test_view_user():
	user     = User(10, "Herp")
	snuggler = User(12, "Derp")
	system_time = 1234567890
	
	view_user = ViewUser(user, snuggler, system_time)
	
	eq_(view_user.user, user)
	eq_(view_user.snuggler, snuggler)
	eq_(view_user.system_time, system_time)
	
	eq_(view_user, Event.inflate(view_user.deflate()))

def test_categorize_user():
	user     = User(10, "Herp")
	snuggler = User(12, "Derp")
	category = "ambiguous"
	system_time = 1234567890
	
	categorize_user = CategorizeUser(user, snuggler, category, system_time)
	
	eq_(categorize_user.user, user)
	eq_(categorize_user.snuggler, snuggler)
	eq_(categorize_user.category, category)
	eq_(categorize_user.system_time, system_time)
	
	eq_(categorize_user, Event.inflate(categorize_user.deflate()))

def test_user_action():
	action = SendMessage(
		User(10, "Herp"),
		"I am a header",
		"I am a message"
	)
	snuggler = User(12, "Derp")
	revisions = [
		UserRevision(
			213231, 
			Page(24253, "Herp", 3), 
			1234567890, 
			"Posting message", 
			ByteDiff(100, 10), 
			"12345678901234567890123467890ab"
		)
	]
	system_time = 1234567890
	
	user_action = UserAction(action, snuggler, revisions, system_time)
	
	eq_(user_action.action, action)
	eq_(user_action.snuggler, snuggler)
	eq_(user_action.revisions, revisions)
	eq_(user_action.system_time, system_time)
	
	eq_(user_action, Event.inflate(user_action.deflate()))