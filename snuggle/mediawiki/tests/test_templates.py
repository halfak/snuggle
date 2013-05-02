from nose.tools import eq_

from ..templates import Templates, TEMPLATES


def run_templates(pairs):
	templates = Templates(TEMPLATES)
	
	for output, markup in pairs:
		eq_(output, set(templates.classes(markup)))


def test_vandalism():
	run_templates([
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
		)
	])
	

def test_spam():
	run_templates([
		(
			set(['spam', 'warning']),
			"""Welcome to Wikipedia. Although everyone is welcome to contribute constructively to the encyclopedia, your addition of one or more external links to the page [[:Tango]] has been reverted.<br />Your edit [http://en.wikipedia.org/w/index.php?diff=552349403&oldid=550853728 here] to [[Tango]] was reverted by an automated bot that attempts to remove links which are discouraged per our [[WP:EL|external links guideline]].  The external link(s) you added or changed (http://www.youtube.com/watch?v=E6X-bYytOuk<!-- matching the [[regex|regex rule]] \byoutube\.com) -->) is/are on my list of links to remove and probably shouldn't be included in Wikipedia. If the external link you inserted or changed was to a [[Wikipedia:Media|media]] file (e.g. a [[Wikipedia:Media help|sound or video]] file) on an external server, then note that linking to such files may be subject to Wikipedia's [[WP:COPYVIO|copyright policy]], as well as other parts of our [[WP:ELNO|external links guideline]].  If the information you linked to is indeed in violation of copyright, then such information should not be linked to.  Please consider using our [[Wikipedia:Upload|upload]] facility to upload a suitable media file, or consider linking to the original.<br />If you were trying to insert an [[Wikipedia:External links|external link]] that does comply with our [[Wikipedia:List of policies|policies]] and [[Wikipedia:List of guidelines|guidelines]], then please accept my creator's apologies and feel free to [[WP:UNDO|undo]] the bot's revert.  However, if the link does not comply with our policies and guidelines, but your edit included other, constructive, changes to the article, feel free to make those changes again without re-adding the link.  Please read Wikipedia's [[WP:EL|external links guideline]] for more information, and consult my [[User:XLinkBot/Reversion reasons|list of frequently-reverted sites]]. For more information about me, see [[User:XLinkBot/FAQ|my FAQ page]]. Thanks!<!-- Template:uw-spam0 --> --[[User:XLinkBot|XLinkBot]] ([[User talk:XLinkBot|talk]]) 00:04, 27 April 2013 (UTC)"""
		)
	])
	


def test_block():
	run_templates([
		(
			set(['block']),
			"""<div class="user-block" style="min-height: 40px"> [[Image:Stop x nuvola.svg|40px|left|alt=|link=]] You have been '''[[Wikipedia:Blocking policy|blocked]]''' '''indefinitely''' from editing for it is fairly obvious you are here and using this account to disrupt this project, and that this is not your main account.  So, this one is blocked for disruptive editing and evasion of [[WP:SCRUTINY]]..   If you think there are good reasons why you should be unblocked, you may [[Wikipedia:Appealing a block|appeal this block]] by adding below this notice the text <!-- Copy the text as it appears on your page, not as it appears in this edit area. Do not include the "tlx|" code. -->{{tlx|unblock|2=reason=''Your reason here &#126;&#126;&#126;&#126;''}}, but you should read the [[Wikipedia:Guide to appealing blocks|guide to appealing blocks]] first. [[User:Courcelles|Courcelles]] 20:52, 3 October 2012 (UTC)</div><!-- Template:uw-blockindef -->"""
		)
	])

def test_teahouse():
	run_templates([
		(
			set(['teahouse']),
			"""\n\n{| style="margin: 2em 4em;"
			|- valign="top"
			| [[File:WP teahouse logo 2.png|alt=Teahouse logo|link=w:en:WP:Teahouse|File:WP teahouse logo 2.png by User:Heatherawalls, licensed under CC BY-SA 3.0]]
			| <div style="background-color:#f4f3f0; color: #393D38; padding: 1em;border-radius:10px; font-size: 1.1em;">
			Hi '''DavidTrichard'''! Thanks for contributing to Wikipedia. <br />Be our guest at [[w:WP:teahouse|the Teahouse]]! The Teahouse is a friendly space where new editors can ask questions about contributing to Wikipedia and get help from peers and experienced editors. I hope to see you there! [[User:Theopolisme|Theopolisme]] ([[w:en:WP:Teahouse/Hosts|I'm a Teahouse host]])
			<div class="submit ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only" role="button" aria-disabled="false"><span class="ui-button-text">[[WP:Teahouse|Visit the Teahouse]]</span></div><small><span style="text-align:right;">This message was delivered automatically by your robot friend, [[User:HostBot|HostBot]] ([[User talk:HostBot|talk]]) 01:16, 27 April 2013 (UTC)</small></span>
			</div> 
			|}
			
			[[Category:Wikipedians who have received a Teahouse invitation]]<!-- Template:Teahouse_HostBot_Invitation -->"""
		)
	])

def test_welcome():
	run_templates([
		(
			set(['welcome']),
			"""<!-- Template from Template:Welcomeg -->
			{| style="background-color:#F5FFFA; padding:0;" cellpadding="0"
			|style="border:1px solid #084080; background-color:#F5FFFA; vertical-align:top; color:#000000;"|
			{| width="100%" cellpadding="0" cellspacing="5" style="vertical-align:top; background-color:#F5FFFA; padding:0;"
			| <div style="margin:0; background-color:#CEF2E0; border:1px solid #084080; text-align:left; padding-left:0.4em; padding-top:0.2em; padding-bottom:0.2em;">Hello, DavidTrichard, and [[Wikipedia:Welcoming committee/Welcome to Wikipedia|Welcome]] to Wikipedia! Thank you for [[Special:Contributions/DavidTrichard|your contributions]] to this free encyclopedia. If you decide that you need help, check out ''Getting Help'' below, ask me on [[User talk:XLinkBot|my talk page]], or place '''{{tl|Help me}}''' on your talk page and ask your question there. Please remember to [[Wikipedia:Signatures|sign your name]] on talk pages by using four tildes (<nowiki>~~~~</nowiki>) or by clicking [[File:Insert-signature.png|alt=|link=]] if shown; this will automatically produce your username and the date. Also, please do your best to always fill in the [[Help:Edit summary|edit summary]] field with your edits. Below are some useful links to facilitate your involvement. Happy editing! [[User:XLinkBot|XLinkBot]] ([[User talk:XLinkBot|talk]]) 00:04, 27 April 2013 (UTC)
			|}
			{{Welcomeg/links}}
			|}
			|}<!--Template:Welcomeg-->"""
		)
	])
	
	
	
	

