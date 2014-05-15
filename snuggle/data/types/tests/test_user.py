from nose.tools import eq_
from mwoauth import AccessToken

from ..user import User, Snuggler

def test_user():
	id = 10
	name = "Herp"
	user = User(id, name)
	
	eq_(user.id, id)
	eq_(user.name, name)
	
	eq_(user, User.deserialize(user.serialize()))

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

def test_snuggler():
	id = 10
	name = "Herp"
	access_token = AccessToken("nothing", "nonsense")
	snuggler = Snuggler(id, name, access_token)
	
	
	eq_(snuggler.id, id)
	eq_(snuggler.name, name)
	eq_(snuggler.access_token, access_token)
	
	# This should not match because the cookies member becomes None when the 
	# object is serialized.
	#neq_(snuggler, Snuggler.deserialize(snuggler.serialize()))
	
	# Check that we're equal with a Snuggler that has no cookies.
	eq_(Snuggler(id, name), Snuggler.deserialize(snuggler.serialize()))
