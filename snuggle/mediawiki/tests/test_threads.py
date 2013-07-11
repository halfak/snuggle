import re
from nose.tools import eq_

from .. import threads
from snuggle.data import types

def test_trace_extractor():
	name = "Foo!"
	extractor = threads.TraceExtractor(
		name,
		re.compile("f(oo)?", re.I),
		[{'superscript': "%(group)s"}]
	)
	
	expected = [
		("herp derp ", None),
		(
			"derp f derp ferp foo",
			types.Trace(name, {'superscript': "oo"})
		),
		(
			"derp fo derp ferp f",
			types.Trace(name, {})
		)
	]
	for markup, icon in expected:
		eq_(extractor.extract(markup), icon)
	
def test_parser():
	markup = """
== July 2013 ==
[[Image:Information.svg|25px|alt=Information icon]] Hello, I'm [[User:SummerPhD|SummerPhD]]. I noticed that you recently removed some content from [[:Bella Thorne]]&nbsp;without explaining why. In the future, it would be helpful to others if you described your changes to Wikipedia with an [[Wikipedia:Edit summary|edit summary]]. If this was a mistake, don't worry: I restored the removed content. If you would like to experiment, you can use the [[WP:Sandbox|sandbox]]. If you think I made a mistake, or if you have any questions, you can leave me a message on [[User_talk:SummerPhD|my talk page]]. Thanks!<!-- Template:uw-delete1 --><!-- Template:uw-cluebotwarning1 --> [[User:SummerPhD|<span style="color:#D70270;background-color:white;">Sum</span><span style="color:#734F96;background-color:white;">mer</span><span style="color:#0038A8;background-color:white;">PhD</span>]] ([[User talk:SummerPhD|talk]]) 00:48, 10 July 2013 (UTC)

== Karina Battis, you are invited to the Teahouse ==


{| style="margin: 2em 4em;"
|- valign="top"
| [[File:WP teahouse logo 2.png|alt=Teahouse logo|link=w:en:WP:Teahouse|File:WP teahouse logo 2.png by User:Heatherawalls, licensed under CC BY-SA 3.0]]
| <div style="background-color:#f4f3f0; color: #393D38; padding: 1em;border-radius:10px; font-size: 1.1em;">
Hi '''Karina Battis'''! Thanks for contributing to Wikipedia. <br />Be our guest at [[w:WP:teahouse|the Teahouse]]! The Teahouse is a friendly space where new editors can ask questions about contributing to Wikipedia and get help from peers and experienced editors. I hope to see you there! [[User_talk:Ryan Vesey|Ryan Vesey]] ([[w:en:WP:Teahouse/Hosts|I'm a Teahouse host]])
<div class="submit ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only" role="button" aria-disabled="false"><span class="ui-button-text">[[WP:Teahouse|Visit the Teahouse]]</span></div><small><span style="text-align:right;">This message was delivered automatically by your robot friend, [[User:HostBot|HostBot]] ([[User talk:HostBot|talk]]) 01:18, 10 July 2013 (UTC)</small></span>
</div> 
|}
[[Category:Wikipedians who have received a Teahouse invitation]]<!-- Template:Teahouse_HostBot_Invitation -->
"""
	extractors = [
		threads.TraceExtractor("user warning", re.compile("Template:uw-[a-z]*([0-9])?", re.I), [{'superscript': "%(group)s"}]),
		threads.TraceExtractor("teahouse invite", re.compile("Template:Teahouse_HostBot_Invitation", re.I), [])
	]
	
	parser = threads.Parser(extractors)
	
	expecteds = [
		types.Thread("July 2013", types.Trace("user warning", {'superscript': '1'})),
		types.Thread("Karina Battis, you are invited to the Teahouse", types.Trace("teahouse invite", {}))
	]
	
	for thread, expected in zip(parser.parse(markup), expecteds):
		eq_(thread, expected)
		
