utils.define('utils.template', function(template,_in_) {
	
	template.PENDING_TEMP = {};
	//template.Q = utils.queue();
	//For backword compatibility
	template.define = function(tname,cb){
		return utils.define(tname).extend('utils.abstracts.template').as(cb);
	};
	template.load = function(obj){
		return utils.require(obj.name || 'utils.abstracts.template').instance(obj);
	};
	template.loadHTML = function(THIS,cb) {
		if(!THIS.$div){
			$.ajax({
				datatype : "html",
				url: "/"+utils.config.contextPath+"/template/" + THIS.handler + "?"+decodeURIComponent($.param({
					_handler : THIS.handler,
					_name : THIS.name
				})),
				type : 'GET',
				data : THIS.params,
				success : function(msg){
					THIS.$div = $(msg);
					if(THIS.$parent && THIS.replace) THIS.$parent.html(THIS.$div);
					else if(THIS.$parent)  THIS.$parent.append(THIS.$div);
					if(cb) cb();
				},
				error : function(msg) {
					console.log('error', msg);
					return null;
				}
			});
		} else {
			if(cb) cb();
		}
		return THIS;
	};
});