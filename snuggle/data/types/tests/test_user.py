from nose.tools import eq_

from ..user import User

def test_user():
	id = 10
	name = "Herp"
	user = User(id, name)
	
	eq_(user.id, id)
	eq_(user.name, name)
	
	eq_(user, User.inflate(user.deflate()))

def test_normalize():
	
	tests = [
		{
			'input': "CamelCaps",
			'expected': "CamelCaps"
		},
		{
			'input': "derp",
			'expected': "Derp"
		},
		{
			'input': "Herp_derp",
			'expected': "Herp derp"
		},
		{
			'input': "Herp_Derp",
			'expected': "Herp Derp"
		}
	]
	
	for test in tests:
		eq_(User.normalize(test['input']), test['expected'])