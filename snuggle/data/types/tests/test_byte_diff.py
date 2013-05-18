from nose.tools import eq_

from ..byte_diff import ByteDiff


def test_constructor():
	bytes = 100
	diff = 10
	byte_diff = ByteDiff(bytes, diff)
	eq_(byte_diff.bytes, bytes)
	eq_(byte_diff.diff, diff)
	
	eq_(byte_diff, ByteDiff.deserialize(byte_diff.serialize()))