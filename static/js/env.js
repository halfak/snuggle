env = {
	delays: {
		update_cursor: 1000, // 1 second
		user_view: 1500, // 1.5 seconds
		check_snuggler_auth: 10000, // 10 seconds
		preview_action: 250, // 0.25 seconds
		element_rotation: 100 // 0.1 seconds
	},
	keys: {
		ESCAPE: 27,
		PAGE_UP: 33,
		PAGE_DOWN: 34,
		LEFT_ARROW: 37,
		UP_ARROW: 38,
		RIGHT_ARROW: 39,
		DOWN_ARROW: 40,
		NUM_1: 49,
		NUM_2: 50,
		NUM_3: 51,
		NUM_PAD_1: 97,
		NUM_PAD_2: 98,
		NUM_PAD_3: 99,
		ENTER: 13,
		SPACE: 32
	},
	miliseconds: {
		SECOND: 1000,
		MINUTE: 1000*60,
		HOUR: 1000*60*60,
		DAY: 1000*60*60*24
	},
	tabindex: {
		user: 1,
		action_menu: 2,
		snuggler_form: 3,
		categorizer: 4,
		user_filters: 50,
		event_filters: 51,
		dropper: 100
	},
	icons: {
		'good-faith': "\u2714",
		'ambiguous': "?",
		'bad-faith': "\u2717",
		//'history': "\u231b",
		'history': "\u231a"
	}
}
