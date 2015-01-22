utils.define('utils.controller', function(controller){
	
	var executable = utils.module("utils.executable");
	var pathname, hash;
	controller.hashchange = function(){
		var _path = document.location.pathname
		var _hash = document.location.hash;
		if (hash != document.location.hash) {
			hash = document.location.hash;
			this.invoke(hash);
		}
		if (pathname != document.location.pathname) {
			pathname = document.location.pathname;
			this.invoke(pathname);
		}
	};
	
	controller.cache = {};
	controller.onchange_map = {};
	controller.refineKey = function(_key){
		return _key.replace(/\{(.*?)\}/gi,'*')
		return _key;// .replace(/\[/gi, '#').replace(/\]/gi, '');
	};
	controller.split = function(key){
		return key.split(/[\/]+/gi);
	};
	controller.invoke = function(_key){
		console.warn("invokd..",_key)
		var key = this.refineKey(_key);
		return this.callFun(key);
	};
	controller.on = function(_key, fun, isHTTP){
		var key = this.refineKey(_key);
		var keys = controller.split(key);
		var ref = this.onchange_fun;
		var _nextKey = keys[0];
		var _key = keys[0];
		for ( var i = 0; i < keys.length - 1; i++) {
			_key = keys[i];
			_nextKey = keys[i + 1];
			_atKey = '@' + _key;
			if (!ref[_atKey])
				ref[_atKey] = {
					key : _key, next : this.next, nextKey : _nextKey
				};
			ref = ref[_atKey];
		}
		ref['@' + _nextKey] = {
			fun : fun,
			key : _nextKey, next : function(o){
				console.warn("oo",o)
				this.fun.apply(controller,o.arg)
			}, isHTTP : isHTTP, nextKey : null
		};
	};

	// execute event handler
	controller._callFun = function(key){
		var keys = controller.split(key);
		if (this.onchange_fun.next) {
			return this.onchange_fun.next({
				url : key, arg : [], index : 0, keys : keys
			});
		}
	};

	controller.next = function(o){
		if (this['@' + o.keys[o.index]]) {
			return this['@' + o.keys[o.index++]].next(o);
		} else if (this['@*']) {
			o.arg.push(o.keys[o.index++]);
			return this['@*'].next(o);
		}
		return true;
	};
	controller.onchange_fun = {
		next : controller.next,
	};
	// Registers an event to be triggered
	controller.callFun = function(key){
		this.onchange_map[key] = true;
		// return this._callFun(key);
		var THIS = this;
		executable.once(function(){
			THIS.trigger();
		});
	};
	// process event queue
	controller.trigger = function(){
		for ( var key in this.onchange_map) {
			var propagation = this._callFun(key);
			delete this.onchange_map[key]
		}
	};
	controller.go = function(url){
		return window.history.pushState(null,null,url);
	};
	controller._ready_ = function(){
	    var pushState = history.pushState;
	    
	    history.pushState = function(state) {
	    	console.warn("url pusing",state);
	        if (typeof history.onpushstate == "function") {
	           // history.onpushstate({state: state});
	        }
	        var ret = pushState.apply(history, arguments);
	        controller.hashchange();
	        return ret;
	    }
		window.onpopstate = history.onpushstate = function(e) {
			console.warn("url changed",e);
			controller.hashchange();
		}
		return controller.hashchange();
	}
});