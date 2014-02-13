from nose.tools import eq_

from ..byte_diff import ByteDiff
from ..user import User, Snuggler
from ..page import Page
from ..revision import UserRevision
from ..category import Categorization
from ..event import Event, ServerStarted, ServerStopped, UILoaded, UsersQueried
from ..event import EventsQueried, UserViewed, UserCategorized, UserActioned
from ..event import SnugglerLoggedIn, SnugglerLoggedOut
from ..user_action import ActionRequest, EditResult

def test_server_started():
	server = "web"
	server_started = ServerStarted(server)
	
	eq_(server_started.server, server)
	
	eq_(server_started, Event.deserialize(server_started.serialize()))

def test_server_stopped():
	server = "web"
	start_time = 1234567890
	stats = {"foo": 5}
	error = "foobar"
	server_stopped = ServerStopped(server, start_time, stats, error)
	
	eq_(server_stopped.server, server)
	eq_(server_stopped.start_time, start_time)
	eq_(server_stopped.stats, stats)
	eq_(server_stopped.error, error)
	
	eq_(server_stopped, Event.deserialize(server_stopped.serialize()))


def test_ui_loaded():
	snuggler = Snuggler(10, "Derp")
	data = {'more': "Derp"}
	ui_loaded = UILoaded(snuggler, data)
	
	eq_(ui_loaded.snuggler, snuggler)
	eq_(ui_loaded.data, data)
	
	eq_(ui_loaded, Event.deserialize(ui_loaded.serialize()))

def test_users_queried():
	filters = {'herp': 10, 'derp': "derpity"}
	wait_time = 1234567.76
	response_length = 6538
	snuggler = Snuggler(10, "Derp")
	data = {'more': "Derp"}
	users_queried = UsersQueried(filters, wait_time, response_length, snuggler, data)
	
	eq_(users_queried.filters, filters)
	eq_(users_queried.wait_time, wait_time)
	eq_(users_queried.response_length, response_length)
	eq_(users_queried.snuggler, snuggler)
	eq_(users_queried.data, data)
	
	eq_(users_queried, Event.deserialize(users_queried.serialize()))

def test_events_queried():
	filters = {'herp': 10, 'derp': "derpity"}
	wait_time = 1234567.76
	response_length = 6538
	snuggler = Snuggler(10, "Derp")
	data = {'more': "Derp"}
	events_queried = EventsQueried(filters, wait_time, response_length, snuggler, data)
	
	eq_(events_queried.filters, filters)
	eq_(events_queried.wait_time, wait_time)
	eq_(events_queried.response_length, response_length)
	eq_(events_queried.snuggler, snuggler)
	eq_(events_queried.data, data)
	
	eq_(events_queried, Event.deserialize(events_queried.serialize()))

def test_user_viewed():
	user     = User(10, "Herp")
	snuggler = Snuggler(12, "Derp")
	system_time = 1234567890
	
	user_viewed = UserViewed(user, snuggler, system_time=system_time)
	
	eq_(user_viewed.user, user)
	eq_(user_viewed.snuggler, snuggler)
	eq_(user_viewed.system_time, system_time)
	
	eq_(user_viewed, Event.deserialize(user_viewed.serialize()))

def test_user_categorized():
	user     = User(10, "Herp")
	snuggler = Snuggler(12, "Derp")
	categorization = Categorization(snuggler, "ambiguous", "foo", 1234567890)
	system_time = 1234567890
	
	user_categorized = UserCategorized(user, categorization, system_time=system_time)
	
	eq_(user_categorized.user, user)
	eq_(user_categorized.categorization, categorization)
	eq_(user_categorized.system_time, system_time)
	
	eq_(user_categorized, Event.deserialize(user_categorized.serialize()))

def test_user_actioned():
	request = ActionRequest(
		"foobar", 
		User(10, "foo"), 
		{"herp": "derp"}, 
		False
	)
	snuggler = Snuggler(12, "Derp")
	results = [
		EditResult(
			213231, 
			"Herp"
		)
	]
	system_time = 1234567890
	
	user_actioned = UserActioned(request, snuggler, results, system_time=system_time)
	
	eq_(user_actioned.results, results)
	eq_(user_actioned.snuggler, snuggler)
	eq_(user_actioned.results, results)
	eq_(user_actioned.system_time, system_time)
	
	eq_(user_actioned, Event.deserialize(user_actioned.serialize()))
