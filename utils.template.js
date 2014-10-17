utils.define('utils.template', function(template,_in_) {
	
	template.PENDING_TEMP = {};
	template.CACHE = {};
	//template.Q = utils.queue();
	//For backword compatibility
	template.define = function(tname,cb){
		return utils.define(tname).extend('utils.abstracts.template').as(cb);
	};
	template.load = function(obj){
		return utils.require(obj.name || 'utils.abstracts.template').instance(obj);
	};
	template.onDomReady = function(THIS,cb){
		if(!THIS.isModal){
			if(THIS.$parent && THIS.replace) THIS.$parent.html(THIS.$div);
			else if(THIS.$parent)  THIS.$parent.append(THIS.$div);
		} else if(THIS.isModal){
			THIS.$div.addClass('modal fade in').show();
			(THIS.$parent || template.$body).append(THIS.$div).append(THIS.$overlay);
		}
		if(cb) cb();
	};
	template.loadHTML = function(THIS,cb) {
		if(!THIS.$div && THIS.handler!=undefined){
			var URL = THIS.handler + "?"+decodeURIComponent($.param({
				_handler : THIS.handler,
				_name : THIS.name
			}));
			if(THIS.cache && template.CACHE[URL]){
				THIS.$div = $(template.CACHE[URL]);
				template.onDomReady(THIS,cb);
			} else {
				$.ajax({
					datatype : "html",
					url: utils.config.contextPath+"template/" + URL,
					type : 'GET',
					data : THIS.params,
					success : function(msg){
						if(THIS.cache) template.CACHE[URL] = msg;
						THIS.$div = $(msg);
						template.onDomReady(THIS,cb);
					},
					error : function(msg) {
						console.log('error', msg);
						return null;
					}
				});
			}
		} else {
			if(cb) cb();
		}
		return THIS;
	};
	
	template._ready_ = function(){
		this.$body = $('body');
		this.bodyTemplate = this.load({
			$div : this.$body 
		});
	}
	
});