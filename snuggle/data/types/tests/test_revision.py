from nose.tools import eq_

from ..byte_diff import ByteDiff
from ..page import Page
from ..revision import Revision, ChangeRevision, UserRevision, Revert
from ..user import User

def test_revision():
	id = 13456
	timestamp = 1234567890
	comment = "I am the comment"
	diff = ByteDiff(100, 20)
	sha1 = "123456789012345678901234567890ab"
	
	revision = Revision(id, timestamp, comment, diff, sha1)
	
	eq_(revision.id, id)
	eq_(revision.timestamp, timestamp)
	eq_(revision.comment, comment)
	eq_(revision.diff, diff)
	eq_(revision.sha1, sha1)
	
	eq_(revision, Revision.inflate(revision.deflate()))
	
def test_change_revision():
	id = 13456
	user = User(10, "Herp")
	page = Page(12, "Anarchism", 0)
	timestamp = 1234567890
	comment = "I am the comment"
	diff = ByteDiff(100, 20)
	sha1 = "123456789012345678901234567890ab"
	
	change_revision = ChangeRevision(
		id, user, page, timestamp, comment, diff, sha1
	)
	
	eq_(change_revision.id, id)
	eq_(change_revision.user, user)
	eq_(change_revision.page, page)
	eq_(change_revision.timestamp, timestamp)
	eq_(change_revision.comment, comment)
	eq_(change_revision.diff, diff)
	eq_(change_revision.sha1, sha1)
	
	eq_(change_revision, ChangeRevision.inflate(change_revision.deflate()))
	
def test_user_revision():
	id = 13456
	page = Page(12, "Anarchism", 0)
	timestamp = 1234567890
	comment = "I am the comment"
	diff = ByteDiff(100, 20)
	sha1 = "123456789012345678901234567890ab"
	
	user_revision = UserRevision(
		id, page, timestamp, comment, diff, sha1
	)
	
	eq_(user_revision.id, id)
	eq_(user_revision.page, page)
	eq_(user_revision.timestamp, timestamp)
	eq_(user_revision.comment, comment)
	eq_(user_revision.diff, diff)
	eq_(user_revision.sha1, sha1)
	
	eq_(user_revision, UserRevision.inflate(user_revision.deflate()))
	
def test_revert():
	id = 13456
	user = User(10, "Herp")
	timestamp = 1234567890
	comment = "I am the comment"
	diff = ByteDiff(100, 20)
	sha1 = "123456789012345678901234567890ab"
	
	revert = Revert(
		id, user, timestamp, comment, diff, sha1
	)
	
	eq_(revert.id, id)
	eq_(revert.user, user)
	eq_(revert.timestamp, timestamp)
	eq_(revert.comment, comment)
	eq_(revert.diff, diff)
	eq_(revert.sha1, sha1)
	
	eq_(revert, Revert.inflate(revert.deflate()))
	
def test_conversions():
	id = 13456
	user = User(10, "Herp")
	page = Page(12, "Anarchism", 0)
	timestamp = 1234567890
	comment = "I am the comment"
	diff = ByteDiff(100, 20)
	sha1 = "123456789012345678901234567890ab"
	
	change_revision = ChangeRevision(
		id, user, page, timestamp, comment, diff, sha1
	)
	revision = Revision(
		id, timestamp, comment, diff, sha1
	)
	user_revision = UserRevision(
		id, page, timestamp, comment, diff, sha1
	)
	revert = Revert(
		id, user, timestamp, comment, diff, sha1
	)
	
	eq_(revision, Revision.convert(change_revision))
	eq_(user_revision, UserRevision.convert(change_revision))
	eq_(revert, Revert.convert(change_revision))