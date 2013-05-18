from nose.tools import eq_

from ..score import Score
from ..user import User

def test_minimal_constructor():
	id = 4567
	user = User(10, "Herp")
	
	score = Score(id, user)
	
	eq_(score.id, id)
	eq_(score.user, user)
	
	eq_(score, Score.deserialize(score.serialize()))

def test_complete_constructor():
	id = 4567
	user = User(10, "Herp")
	value = .2342322
	attempts = 2
	
	score = Score(id, user, value, attempts)
	
	eq_(score.id, id)
	eq_(score.user, user)
	eq_(score.score, value)
	eq_(score.attempts, attempts)
	
	eq_(score, Score.deserialize(score.serialize()))