from nose.tools import eq_

from ..user_action import ActionRequest, OperationResult, EditPreview, EditResult, WatchPreview, WatchResult

from ..user import User

def test_action_request():
	action_name = "send message"
	user = User(10, "Herp")
	fields = {'foo': "Bar"}
	
	action_request = ActionRequest(
		action_name,
		user,
		fields
	)
	
	eq_(action_request.action_name, action_name)
	eq_(action_request.user, user)
	eq_(action_request.fields, fields)
	
	eq_(action_request, ActionRequest.deserialize(action_request.serialize()))

def test_edit_preview():
	html = "<b>Foo</b>"
	page_name = "Herp Derp"
	comment = "Herp derp derp"
	
	edit_preview = EditPreview(
		page_name,
		html,
		comment
	)
	
	eq_(edit_preview.page_name, page_name)
	eq_(edit_preview.html, html)
	eq_(edit_preview.comment, comment)
	
	eq_(edit_preview, OperationResult.deserialize(edit_preview.serialize()))

def test_edit_result():
	rev_id = 10
	page_name = "Herp Derp"
	
	edit_result = EditResult(
		rev_id,
		page_name
	)
	
	eq_(edit_result.page_name, page_name)
	eq_(edit_result.rev_id, rev_id)
	
	eq_(edit_result, OperationResult.deserialize(edit_result.serialize()))

def test_watch_preview():
	page_name = "Herp Derp"
	
	watch_preview = WatchPreview(
		page_name,
	)
	
	eq_(watch_preview.page_name, page_name)
	
	eq_(watch_preview, OperationResult.deserialize(watch_preview.serialize()))

def test_watch_result():
	page_name = "Herp Derp"
	
	watch_result = WatchResult(
		page_name,
	)
	
	eq_(watch_result.page_name, page_name)
	
	eq_(watch_result, OperationResult.deserialize(watch_result.serialize()))
