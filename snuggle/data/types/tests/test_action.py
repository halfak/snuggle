from nose.tools import eq_

"""TODO:
from ..action import Action, SendMessage, TeahouseInvite, ReportVandalism
from ..user import User
def test_send_message():
	user = User(10, "Herp")
	header = "I am the header"
	message = "I am the message"
	
	send_message = SendMessage(
		user,
		header,
		message
	)
	
	eq_(send_message.user, user)
	eq_(send_message.header, header)
	eq_(send_message.message, message)
	
	eq_(send_message, Action.inflate(send_message.deflate()))
	
	assert len(send_message.markup()) > 0

def test_teahouse_invite():
	user = User(10, "Herp")
	header = "I am the header"
	message = "I am the message"
	template = "Invitation"
	
	teahouse_invite = TeahouseInvite(
		user,
		header,
		message,
		template
	)
	
	eq_(teahouse_invite.user, user)
	eq_(teahouse_invite.header, header)
	eq_(teahouse_invite.message, message)
	eq_(teahouse_invite.template, template)
	
	eq_(teahouse_invite, Action.inflate(teahouse_invite.deflate()))
	
	assert len(teahouse_invite.markup()) > 0

def test_report_vandalism():
	user = User(10, "Herp")
	reason = "he tried to sell me snake oil"
	
	report_vandalism = ReportVandalism(
		user,
		reason
	)
	
	eq_(report_vandalism.user, user)
	eq_(report_vandalism.reason, reason)
	
	eq_(report_vandalism, Action.inflate(report_vandalism.deflate()))
	
	assert len(report_vandalism.markup()) > 0
"""
