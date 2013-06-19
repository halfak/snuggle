from nose.tools import eq_

from .. import parsing




def test_sections():
	markup = """
== Welcome! ==
<!-- Template from Template:Welcomeg -->
{| style="background-color:#F5FFFA; padding:0;" cellpadding="0"
|style="border:1px solid #084080; background-color:#F5FFFA; vertical-align:top; color:#000000;"|
{| width="100%" cellpadding="0" cellspacing="5" style="vertical-align:top; background-color:#F5FFFA; padding:0;"
| <div style="margin:0; background-color:#CEF2E0; border:1px solid #084080; text-align:left; padding-left:0.4em; padding-top:0.2em; padding-bottom:0.2em;">Hello, DavidTrichard, and [[Wikipedia:Welcoming committee/Welcome to Wikipedia|Welcome]] to Wikipedia! Thank you for [[Special:Contributions/DavidTrichard|your contributions]] to this free encyclopedia. If you decide that you need help, check out ''Getting Help'' below, ask me on [[User talk:XLinkBot|my talk page]], or place '''{{tl|Help me}}''' on your talk page and ask your question there. Please remember to [[Wikipedia:Signatures|sign your name]] on talk pages by using four tildes (<nowiki>~~~~</nowiki>) or by clicking [[File:Insert-signature.png|alt=|link=]] if shown; this will automatically produce your username and the date. Also, please do your best to always fill in the [[Help:Edit summary|edit summary]] field with your edits. Below are some useful links to facilitate your involvement. Happy editing! [[User:XLinkBot|XLinkBot]] ([[User talk:XLinkBot|talk]]) 00:04, 27 April 2013 (UTC)
|}
{{Welcomeg/links}}
|}
|}<!--Template:Welcomeg-->
== April 2013 ==
Welcome to Wikipedia. Although everyone is welcome to contribute constructively to the encyclopedia, your addition of one or more external links to the page [[:Tango]] has been reverted.<br />Your edit [http://en.wikipedia.org/w/index.php?diff=552349403&oldid=550853728 here] to [[Tango]] was reverted by an automated bot that attempts to remove links which are discouraged per our [[WP:EL|external links guideline]].  The external link(s) you added or changed (http://www.youtube.com/watch?v=E6X-bYytOuk<!-- matching the [[regex|regex rule]] \byoutube\.com) -->) is/are on my list of links to remove and probably shouldn't be included in Wikipedia. If the external link you inserted or changed was to a [[Wikipedia:Media|media]] file (e.g. a [[Wikipedia:Media help|sound or video]] file) on an external server, then note that linking to such files may be subject to Wikipedia's [[WP:COPYVIO|copyright policy]], as well as other parts of our [[WP:ELNO|external links guideline]].  If the information you linked to is indeed in violation of copyright, then such information should not be linked to.  Please consider using our [[Wikipedia:Upload|upload]] facility to upload a suitable media file, or consider linking to the original.<br />If you were trying to insert an [[Wikipedia:External links|external link]] that does comply with our [[Wikipedia:List of policies|policies]] and [[Wikipedia:List of guidelines|guidelines]], then please accept my creator's apologies and feel free to [[WP:UNDO|undo]] the bot's revert.  However, if the link does not comply with our policies and guidelines, but your edit included other, constructive, changes to the article, feel free to make those changes again without re-adding the link.  Please read Wikipedia's [[WP:EL|external links guideline]] for more information, and consult my [[User:XLinkBot/Reversion reasons|list of frequently-reverted sites]]. For more information about me, see [[User:XLinkBot/FAQ|my FAQ page]]. Thanks!<!-- Template:uw-spam0 --> --[[User:XLinkBot|XLinkBot]] ([[User talk:XLinkBot|talk]]) 00:04, 27 April 2013 (UTC)

== DavidTrichard, you are invited to the Teahouse ==


{| style="margin: 2em 4em;"
|- valign="top"
| [[File:WP teahouse logo 2.png|alt=Teahouse logo|link=w:en:WP:Teahouse|File:WP teahouse logo 2.png by User:Heatherawalls, licensed under CC BY-SA 3.0]]
| <div style="background-color:#f4f3f0; color: #393D38; padding: 1em;border-radius:10px; font-size: 1.1em;">
Hi '''DavidTrichard'''! Thanks for contributing to Wikipedia. <br />Be our guest at [[w:WP:teahouse|the Teahouse]]! The Teahouse is a friendly space where new editors can ask questions about contributing to Wikipedia and get help from peers and experienced editors. I hope to see you there! [[User:Theopolisme|Theopolisme]] ([[w:en:WP:Teahouse/Hosts|I'm a Teahouse host]])
<div class="submit ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only" role="button" aria-disabled="false"><span class="ui-button-text">[[WP:Teahouse|Visit the Teahouse]]</span></div><small><span style="text-align:right;">This message was delivered automatically by your robot friend, [[User:HostBot|HostBot]] ([[User talk:HostBot|talk]]) 01:16, 27 April 2013 (UTC)</small></span>
</div> 
|}

[[Category:Wikipedians who have received a Teahouse invitation]]<!-- Template:Teahouse_HostBot_Invitation -->"""
	
	sections = list(parsing.sections(markup))
	
	print(sections[0])
	
	eq_(sections[0][0], "Welcome!")
	eq_(sections[0][1][:4], "<!--")
	
	eq_(sections[1][0], "April 2013")
	eq_(sections[1][1][:4], "Welc")
	
	eq_(sections[2][0], "DavidTrichard, you are invited to the Teahouse")
	eq_(sections[2][1][:4], "\n\n{|")
