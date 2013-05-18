from nose.tools import eq_

from snuggle import util

from ..desirability import Desirability
from ..score import Score
from ..user import User

def test_empty_constructor():
	desirability = Desirability()
	eq_(desirability.scores, {})
	
	eq_(desirability.likelihood(), util.desirability.likelihood([]))
	
def test_constructor():
	scores = [
		Score(1231231, User(10, "Herp"), .35),
		Score(1231232, User(10, "Herp"), .65),
		Score(1231233, User(10, "Herp"), .10),
		Score(1231234, User(10, "Herp"), .75)
	]
	desirability = Desirability()
	for score in scores:
		desirability.add_score(score)
	
	eq_(
		desirability.likelihood(),
		util.desirability.likelihood(
			[score.score for score in scores]
		)
	)
	
	eq_(desirability, Desirability.deserialize(desirability.serialize()))

