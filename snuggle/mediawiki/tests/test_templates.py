from nose.tools import eq_

from ..templates import Templates, TEMPLATES

def test_vandalism1():
	templates = Templates(TEMPLATES)
	pairs = [
		(
			set(['vandal', 'warning', 'level_1']),
			"""[[File:Information.svg|25px|alt=|link=]] Hello, I'm [[User:Telfordbuck|Telfordbuck]]. I wanted to let you know that I undid one or more of [[Special:Contributions/Brianna001|your recent contributions]]&nbsp;to [[:Grand Duchess Anastasia Nikolaevna of Russia]] because it didn't appear constructive. If you think I made a mistake, or if you have any questions, you can leave me a message on [[User_talk:Telfordbuck|my talk page]]. <!-- Template:uw-vandalism1 --><!-- Template:uw-cluebotwarning1 -->   [[User:Telfordbuck|Telfordbuck]] ([[User talk:Telfordbuck|talk]]) 20:35, 3 October 2012 (UTC)"""
		),
		(
			set(['vandal', 'warning', 'level_1']),
			"""[[Image:Information.svg|left|25px|alt=|link=]] Hello, and welcome to Wikipedia. This is a message letting you know that one of your recent edits has been undone by an automated computer program called [[User:ClueBot NG|ClueBot NG]].
			{{clear}}
			* ClueBot NG makes very few [[User:ClueBot NG#Information About False Positives|mistakes]], but it does happen. If you believe the change you made was constructive, please [[User:ClueBot NG#Information About False Positives|read about it]], [{{User:ClueBot NG/Warnings/FPReport|1250274}} report it here], remove this message from your talk page, and then make the edit again.
			* For help, take a look at the [[Wikipedia:Introduction|introduction]].
			* The following is the log entry regarding this message: [[Orange roughy]] was [http://en.wikipedia.org/w/index.php?title=Orange+roughy&diff=515841843&oldid=513628408 changed] by [[Special:Contributions/Ilovebirds7|Ilovebirds7]] [[User:Ilovebirds7|(u)]] [[User talk:Ilovebirds7|(t)]] ANN scored at 0.963573 on 2012-10-03T19:18:23+00:00 <!-- MySQL ID: 1250274 -->. Thank you. <!-- Template:uw-cluebotwarning1 --><!-- Template:uw-vandalism1 --> [[User:ClueBot NG|ClueBot NG]] ([[User talk:ClueBot NG|talk]]) 19:18, 3 October 2012 (UTC)"""
		),
		(
			set(['block']),
			"""<div class="user-block" style="min-height: 40px"> [[Image:Stop x nuvola.svg|40px|left|alt=|link=]] You have been '''[[Wikipedia:Blocking policy|blocked]]''' '''indefinitely''' from editing for it is fairly obvious you are here and using this account to disrupt this project, and that this is not your main account.  So, this one is blocked for disruptive editing and evasion of [[WP:SCRUTINY]]..   If you think there are good reasons why you should be unblocked, you may [[Wikipedia:Appealing a block|appeal this block]] by adding below this notice the text <!-- Copy the text as it appears on your page, not as it appears in this edit area. Do not include the "tlx|" code. -->{{tlx|unblock|2=reason=''Your reason here &#126;&#126;&#126;&#126;''}}, but you should read the [[Wikipedia:Guide to appealing blocks|guide to appealing blocks]] first. [[User:Courcelles|Courcelles]] 20:52, 3 October 2012 (UTC)</div><!-- Template:uw-blockindef -->"""
		)
	]
	for output, markup in pairs:
		print(list(templates.search(markup)))
		eq_(output, set(templates.classes(markup)))
	
	
	

