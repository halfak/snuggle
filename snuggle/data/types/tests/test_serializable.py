import json
from nose.tools import eq_

from ..serializable import Type, Dict, List

class Foo(Type):

	def __init__(self, id, parent=None, d=None, l=None):
		self.id = int(id)
		self.parent = Foo.deserialize(parent) if parent != None else None
		self.d = Dict.deserialize(Foo, d) if d != None else None
		self.l = List.deserialize(Foo, l) if l != None else None
	
class Bar(Type):
	
	def __init__(self, id, foos):
		self.id = int(id)
		self.foos = List.deserialize(Foo, foos)

def test_dict():
	d = Dict({5: Foo(5), 6: Foo(6)})
	
	eq_(d, Dict.deserialize(Foo, d.serialize()))

def test_list():
	l = List([Foo(5), Foo(6)])
	
	eq_(l, List.deserialize(Foo, l.serialize()))

def test_simple_type():
	id = 5
	parent_id = 6
	parent = Foo(parent_id)
	foo = Foo(id, parent)
	
	eq_(foo, Foo.deserialize(foo.serialize()))

def test_complex_type():
	id = 5
	d = Dict({5: Foo(5), 6: Foo(6)})
	l = [Foo(1), Foo(2, Foo(3))]
	parent = Foo(6)
	foo = Foo(id, parent, d, l)
	
	eq_(foo, Foo.deserialize(foo.serialize()))
	
def test_deep_complex_type():
	b = Bar(
		1000,
		[Foo(5, l=[Foo(6)])]
	)
	
	doc = json.loads(json.dumps(b.serialize()))
	
	eq_(b, Bar.deserialize(b))
	
