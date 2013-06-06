from nose.tools import eq_

from ..activity import Activity
from ..byte_diff import ByteDiff
from ..category import Category, Categorization
from ..desirability import Desirability
from ..new_user import NewUser
from ..page import Page
from ..revision import UserRevision
from ..score import Score
from ..talk import Talk, Thread
from ..user import User, Snuggler


def test_minimal_constructor():
	id = 10
	name = "Herp"
	registration = 1234567890
	
	new_user = NewUser(id, name, registration)
	
	eq_(new_user.id, id)
	eq_(new_user.name, name)
	eq_(new_user.registration, registration)
	
	eq_(new_user, NewUser.deserialize(new_user.serialize()))

def test_complete_constructor():
	id = 134567
	name = "Herp"
	registration = 1234567890
	views = 0
	has_talk_page = True
	has_user_page = False
	activity = Activity(
		1234567890,
		10,
		5,
		{
			23456: UserRevision(
				23456, 
				Page(12, "Anarchism", 0), 
				1234567890, "", 
				ByteDiff(10, 100), 
				"123456789012345678901234567890ab"
			)
		},
		{
			'all': 1,
			'0': 1
		}
	)
	scores = [
		Score(1231231, User(10, "Herp"), .35),
		Score(1231232, User(10, "Herp"), .65),
		Score(1231233, User(10, "Herp"), .10),
		Score(1231234, User(10, "Herp"), .75)
	]
	desirability = Desirability()
	for score in scores:
		desirability.add_score(score)
	
	talk = Talk(123456, [Thread("Quit derping", ["vandal", "level_2"])])
	category = Category([Categorization(Snuggler(12, "Herp"), "ambiguous")])
	
	new_user = NewUser(
		id, name, registration, views,
		has_talk_page, has_user_page,
		activity, desirability, talk, category
	)
	
	
	eq_(new_user.id, id)
	eq_(new_user.name, name)
	eq_(new_user.registration, registration)
	eq_(new_user.views, views)
	eq_(new_user.activity, activity)
	eq_(new_user.desirability, desirability)
	eq_(new_user.talk, talk)
	eq_(new_user.category, category)
	
	eq_(new_user, NewUser.deserialize(new_user.serialize()))
