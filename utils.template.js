utils.define('utils.template', function(template,_in_) {
	
	var json = utils.require('utils.json');
	template.PENDING_TEMP = {};
	template.CACHE = {};
	var TEMP_DELIMITER = '<rx::data/>';
	//template.Q = utils.queue();
	//For backword compatibility
	template.define = function(tname,cb){
		return utils.define(tname).extend('utils.abstracts.template').as(cb);
	};
	template.load = function(obj){
		return utils.require(obj.name || 'utils.abstracts.template').instance(obj);
	};
	template.onDomReady = function(THIS,cb,data){
		if(!THIS.isModal){
			if(THIS.$parent && THIS.replace) THIS.$parent.html(THIS.$div);
			else if(THIS.$parent)  THIS.$parent.append(THIS.$div);
		} else if(THIS.isModal){
			THIS.$div.addClass('modal fade in').show();
			(THIS.$parent || template.$body).append(THIS.$div).append(THIS.$overlay);
		}
		if(cb) cb(data);
	};
	template.loadHTML = function(THIS,cb) {
		if(!THIS.$div && THIS.handler!=undefined){
			var URL = THIS.handler + "?"+decodeURIComponent($.param({
				_handler : THIS.handler,
				_name : THIS.name
			}));
			if(THIS.cache && template.CACHE[URL]){
				THIS.$div = $(template.CACHE[URL].html);
				template.onDomReady(THIS,cb,template.CACHE[URL].data);
			} else {
				$.ajax({
					datatype : "html",
					url: utils.config.contextPath+"template/" + URL,
					type : 'GET',
					data : THIS.params,
					success : function(msg){
						var msgs = msg.split(TEMP_DELIMITER);
						if(THIS.cache) template.CACHE[URL] = {
								html : msgs[0], data : msgs[2]
						}
						THIS.$div = $(msgs[0]);
						template.onDomReady(THIS,cb,json.parse(msgs[2]));
						template.$scripts.append(msgs[1]);
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
		this.page = this.load({
			$div : this.$body 
		});//.onReady(function(){
			this.$scripts = $('#script_logs');
			var $json_div = $('#page_json',template.page.$div);
			var serverData = utils.json.parse($json_div.attr('data-value')) || {};
			template.page.update(serverData);
		//})
	}
	
});