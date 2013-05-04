from nose.tools import eq_

from ..activity import Activity
from ..byte_diff import ByteDiff
from ..page import Page
from ..revision import UserRevision

def test_empty_constructor():
	activity = Activity()
	eq_(activity.reverted, 0)
	eq_(activity.self_reverted, 0)

def test_constructor():
	reverted = 10
	self_reverted = 5
	revisions = {
		234567: UserRevision(
			234567, 
			Page(12, "Anarchism", 0), 
			1234567890, "", 
			ByteDiff(10, 100), 
			"123456789012345678901234567890ab", 
			revert=None
		)
	}
	counts = {
		'all': 1,
		'0': 1
	}
	activity = Activity(
		reverted,
		self_reverted,
		revisions,
		counts
	)
	eq_(activity.reverted, reverted)
	eq_(activity.self_reverted, self_reverted)
	eq_(activity.revisions, revisions)
	eq_(activity.counts, counts)
	
	eq_(activity, Activity.inflate(activity.deflate()))