utils.define('utils.template', function(template,_in_) {
	
	template.PENDING_TEMP = {};
	//template.Q = utils.queue();
	//For backword compatibility
	template.define = function(tname,cb){
		return utils.define(tname).extend('utils.abstracts.template').as(cb);
	};
	template.load = function(obj){
		console.info(obj,utils.require(obj.name))
		return utils.require(obj.name).instance(obj);
	};
	template.loadHTML = function(THIS,cb) {
		if(!THIS.$div){
			$.ajax({
				datatype : "html",
				url: "/"+utils.config.contextPath+"/template/" + THIS.handler,
				type : 'GET',
				data : {},
				success : function(msg){
					THIS.$div = $(msg);
					console.log(THIS.$parent,THIS.$div)
					if(THIS.$parent) THIS.$parent.append(THIS.$div);
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