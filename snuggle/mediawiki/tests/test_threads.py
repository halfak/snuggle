import re
from nose.tools import eq_

from .. import threads

def test_matcher():
	matcher = threads.Matcher(
		re.compile("f(oo)?"),
		[{'superscript': "%(group)s"}],
		{
			'label': "foo",
			'style': {
				'border-color': "#000",
				'background-color': "#ccc",
				'box-shadow-color': "#000"
			}
		}
	)
	
	expected = [
		("herp derp ", None),
		(
			"derp f derp ferp foo",
			{
				'label': "foo",
				'superscript': "oo",
				'style': {
					'border-color': "#000",
					'background-color': "#ccc",
					'box-shadow-color': "#000"
				}
			}
		),
		(
			"derp foo derp ferp f",
			{
				'label': "foo",
				'style': {
					'border-color': "#000",
					'background-color': "#ccc",
					'box-shadow-color': "#000"
				}
			}
		)
	]
	
	for markup, icon in expected:
		eq_(matcher.match(markup), icon)
	
	
	
