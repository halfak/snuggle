from nose.tools import eq_

from ..user import User

def test_user():
	id = 10
	name = "Herp"
	user = User(id, name)
	
	eq_(user.id, id)
	eq_(user.name, name)
	
	eq_(user, User.inflate(user.deflate()))