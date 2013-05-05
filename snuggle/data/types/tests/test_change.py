from nose.tools import eq_

from ..byte_diff import ByteDiff
from ..change import Change
from ..new_user import NewUser
from ..page import Page
from ..revision import ChangeRevision
from ..user import User

def test_new_user_change():
	id = 503789283
	timestamp = 1234567890
	type = "new user"
	new_user = NewUser(
		10,
		"Herp",
		1234567890
	)
	change = Change(
		id, 
		timestamp, 
		type, 
		new_user
	)
	eq_(change.id, id)
	eq_(change.timestamp, timestamp)
	eq_(change.type, type)
	eq_(change.change, new_user)
	
	eq_(change, Change.inflate(change.deflate()))

def test_new_revision_change():
	id = 503789283
	timestamp = 1234567890
	type = "new revision"
	new_revision = ChangeRevision(
		213, 
		User(10, "Herp"), 
		Page(12, "Anarchism", 0), 
		1234567890, 
		"Foo comment", 
		ByteDiff(10, 100), 
		"12345678901234567890ab"
	)
	change = Change(
		id, 
		timestamp, 
		type, 
		new_revision
	)
	eq_(change.id, id)
	eq_(change.timestamp, timestamp)
	eq_(change.type, type)
	eq_(change.change, new_revision)
	
	eq_(change, Change.inflate(change.deflate()))