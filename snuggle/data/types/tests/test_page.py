from nose.tools import eq_

from ..page import Page

def test_constructor():
	id = 10
	title = "Foobar"
	namespace = 8
	
	page = Page(id, title, namespace)
	
	eq_(page.id, id)
	eq_(page.title, title)
	eq_(page.namespace, namespace)
	
	eq_(page, Page.inflate(page.deflate()))

