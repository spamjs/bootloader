utils.config.set({
	debug : true,
	contextPath : 'app',
	resourcePath : 'resources',
	dataPath : 'data',
	moduleDir : {
		'dff.*' : 'dff/models/',
		'utils.*' : '../libs/jqgeeks/utils/'
	},
	template : 'folder',
	combine : true,
	TAG_ATTR : {
		DATA_PATH : 'rx-path',
		DATA_ONCHANGE : 'rx-onchange',
		DATA_ONCLICK : 'rx-click',
		DATA_FORMAT : 'data-format'
	}
});