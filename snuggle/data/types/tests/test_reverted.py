from nose.tools import eq_

from ..byte_diff import ByteDiff
from ..page import Page
from ..reverted import Reverted
from ..revision import Revision, ChangeRevision
from ..user import User

def test_constructor():
	revision = ChangeRevision(
		1235670, 
		User(10, "Herp"), 
		Page(12, "Anarchism", 0), 
		1234567890, 
		"I am the comment", 
		ByteDiff(100, 10), 
		"12345678901234567890123457890ab"
	)
	history = {
		"12345678901234567890123457890aa",
		revision.sha1,
		"12345678901234567890123457890ac",
		"12345678901234567890123457890ad",
		"12345678901234567890123457890ae"
	}
	reverted = Reverted(revision, history)
	
	eq_(reverted.revision, revision)
	
	not_reverting = Revision(
		12312, 1234567890, "I am the comment", ByteDiff(100, 10), 
		"123456789012345678901234567890zz"
	)
	revert_to = Revision(
		12313, 1234567890, "I am the comment", ByteDiff(100, 10), 
		revision.sha1
	)
	revert = Revision(
		12314, 1234567890, "I am the comment", ByteDiff(100, 10), 
		"12345678901234567890123457890aa"
	)
	
	# Check #1
	assert not reverted.check(not_reverting)
	eq_(reverted.last_id, not_reverting.id)
	
	# Check #2
	assert not reverted.check(revert_to)
	eq_(reverted.last_id, revert_to.id)
	
	# Check #3
	assert reverted.check(revert)
	eq_(reverted.last_id, revert.id)
	
	# Check #4 & #5
	reverted.check(Revision(12315, 1234567890, "", ByteDiff(100, 10), "12345678901234567890123457890aa"))
	reverted.check(Revision(12316, 1234567890, "", ByteDiff(100, 10), "12345678901234567890123457890aa"))
	
	assert reverted.done()
	
	
	eq_(reverted, Reverted.deserialize(reverted.serialize()))
	
