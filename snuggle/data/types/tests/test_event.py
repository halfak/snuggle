from nose.tools import eq_

from ..action import SendMessage
from ..byte_diff import ByteDiff
from ..user import User
from ..page import Page
from ..revision import UserRevision
from ..event import Event, ViewUser, CategorizeUser, UserAction


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