utils.define('utils.abstracts.page', function(page,_instance_) {
	var custom = utils.require('utils.custom');
	var _template = utils.require('utils.template');

	page.find = _page.query = _page.$ = function(a,b){
		return $(a,b);
	};
	page.on = function(selector,eName,callback,d){
		if(eName==undefined)
			return this.$body.find(selector);
		else if(callback==undefined){
			this.$body.find(selector).trigger(eName);
		}
		return this.$body.on(eName,selector,callback,d);
	};
	utils.ready(function(){
		page.$body = $('body');
		page.data = utils.parse($('#page_json').attr('data-value'));
	});
});