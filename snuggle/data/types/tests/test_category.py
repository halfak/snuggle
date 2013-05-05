from nose.tools import eq_

from ..category import Category, Categorization
from ..user import User

def test_empty_constructor():
	category = Category()
	eq_(category.history, [])

def test_categorization():
	snuggler = User(10, "Herp")
	category = "good-faith"
	timestamp = 1234567890
	categorization = Categorization(
		snuggler,
		category,
		timestamp
	)
	eq_(categorization.snuggler, snuggler)
	eq_(categorization.category, category)
	eq_(categorization.timestamp, timestamp)

def test_category():
	history = [
		Categorization(User(10, "Herp"), "good-faith", 1234567890),
		Categorization(User(11, "Derp"), "bad-faith", 1234567890),
	]
	category = Category(history)
	eq_(category.history, history)
	
	eq_(category, Category.inflate(category.deflate()))