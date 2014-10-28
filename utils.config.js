utils.config.set({
	debug : true,
	contextPath : 'app',
	resourcePath : 'resources',
	moduleDir : {
		'dff.*' : 'dff/models/',
		'utils.*' : '../libs/jqgeeks/utils/'
	},
	template : 'folder',
	combine : true,
});