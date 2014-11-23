utils.define('utils.controller', function(controller){
	controller.hash;
	controller.load = function(obj){
		return $.ajax(obj);
	};
	controller.hashchange = function(){
		if (this.hash != document.location.hash) {
			this.hash = document.location.hash;
			this.invoke(this.hash.substr(1));
			return true;
		} else
			return false;
	};
	
	controller.cache = {};
	controller.onchange_map = {};
	controller.refineKey = function(_key){
		return _key;// .replace(/\[/gi, '#').replace(/\]/gi, '');
	};
	controller.split = function(key){
		return key.split(/[\/]+/gi);
	};
	controller.invoke = function(_key){
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
			key : _nextKey, next : fun, isHTTP : isHTTP, nextKey : null
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
		utils.executeOnce(function(){
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
	controller._ready_ = function(){
		$(window).on('hashchange', function(e){
			return controller.hashchange();
		});
		return controller.hashchange();
	}
});