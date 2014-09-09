utils.define('utils.odo', function(odo, _instance_) {
	utils.require('utils.executable');
	//Data Change Event
	odo.dataEvent = function dataEvent(index, keys, key, value) {
		this.index = index;
		this.keys = keys;
		this.path = key;
		this.vars = []
		this.value = value;
		this.length = 0;
		this.push = Array.prototype.push;
		this.pop = Array.prototype.pop;
		this.splice = Array.prototype.splice;
		this.push(key);
		this.preventEvent = false;
	};
	odo.dataEvent.prototype.stop = function() {
		this.preventEvent = true;
	};
	odo.dataEvent.prototype.next = function() {
		return this.keys[this.index++];
	};
	odo.dataEvent.prototype.merge = function(dEvent) {
		if (this === dEvent)
			return this;
		this.push(dEvent.path);
	};
	
	//ODO instance properties/definition
	odo._instance_ = function(_fromData) {
		this.data = _fromData || {};
		var _data, _onKey, changeKey;
		this.onchange_map = {};
		this.event_map = {};
		this.replace_path = {};
		this.SLAVE = null;
		this.onchange_fun = {
			next : this.next
		};
	};
	_instance_.initSlave = function() {
		this.SLAVE = new ODO(this.data);
		return this.SLAVE;
	};
	_instance_.blockPath = function(path) {
		this.replace_path[path] = true;
		return this;
	};
	_instance_.refineKey = function(_key) {
		return _key.replace(/\[/gi, '#').replace(/\]/gi, '');
	};
	// updates/extends the data map from src map
	_instance_.update = function(src) {
		return this._update(this.data, src, '');
	};
	// sets the value of node at given path
	_instance_.set = function(_key, finalValue) {
		var key = this.refineKey(_key);
		this.getRef(key);
		// var changeKey = key.replace(/#[0-9]+/gi, '#');
		_data[_onKey] = finalValue;
	};
	// sets the value of node at given path, also triggers onChange on UI-side
	_instance_.change = this.changeValue = function(_key, finalValue) {
		var key = this.refineKey(_key);
		this.getRef(key);
		_data[_onKey] = finalValue;
		this.callFun(key, finalValue);
	};
	// the value of node at given path
	_instance_.get = function(_key) {
		if (_key == undefined)
			return this.data;
		var key = this.refineKey(_key);
		this.getRef(key);
		return _data[_onKey];
	};
	// converts the data map to json string
	_instance_.toJson = function() {
		return utils.stringify(this.data);
	};
	// returns the reference to a node
	_instance_.getRef = function(key) {
		_data = this.data;
		changeKey = '';
		var keys = key.replace(/#/gi, '#.').split('.');
		changeKey = _onKey = keys[0];
		// this.callFun(changeKey);
		for (var i = 0; i < keys.length - 1; i++) {
			var nextKey = keys[i + 1];
			var isArray = (_onKey.indexOf('#') !== -1)
			_onKey = _onKey.replace('#', '');
			if (!_data[_onKey]) {
				if (!isArray)
					_data[_onKey] = {};
				else
					_data[_onKey] = [];
			}
			_data = _data[_onKey];
			_onKey = nextKey;
			changeKey = changeKey + (isArray ? '#' : ('.' + nextKey));
		}
	};
	_instance_._update = function(_target, src, path) {
		// copy reference to target object
		var target = _target || {}, options;
		// Handle case when target is a string or something
		if (typeof target !== "object" && !jQuery.isFunction(target))
			target = {};
		// Only deal with non-null/undefined values
		if ((options = src) != null) {
			// Extend the base object
			for ( var name in options) {
				var src = target[name], copy = options[name];
				// Prevent never-ending loop
				if (target === copy)
					continue;
				// Recurse if we're merging object values
				if (copy && typeof copy === "object" && !copy.nodeType
						&& copy._tag_ == undefined) {
					var nextPath = path + name;
					if (!this.replace_path[nextPath]) {
						target[name] = this._update(src
								|| (copy.length != null ? [] : {}), copy,
								nextPath + (copy.length != null ? '#' : '.'));
					} else {
						target[name] = copy;
						this.callFun(nextPath, copy);
					}
				} else if (copy !== undefined) {
					// Don't bring in undefined values
					target[name] = copy;
					this.callFun(path + name, copy);
				}
			}
		}
		// Return the modified object
		return target;
	};
	_instance_.patch = function(src) {
		return this._patch(this.data,src)
	};
	_instance_._patch = function(_target, src, key) {
		console.log(_target, src, key);
		var doClean;
		for(var key in src){
			if(typeof src[key] ==='object' && !src[key].nodeType){
				if(key=='~'){
					for(var i in src[key]){
						this._patch(_target,src[key][i],key)
					}
				} else if(key.indexOf('~')==0){
					var ikey = key.slice(1);
					for(var i in src[key]){
						this._patch(_target[ikey],src[key][i],ikey)
					}
				} else if(key.indexOf('+')==0){
					var ikey = key.slice(1);
					console.log('added :: ',ikey,_target,src[key])
					_target[ikey] = src[key];
				} 
			} else if(key.indexOf('-')==0){
				var ikey = key.slice(1);
				console.log('removed :: ',ikey,_target,src[key])
				delete _target[ikey]; doClean = true;
			} else {
				//Copy Object
				_target[key] = src[key];
				console.log('clicked...',src[key])
			}
		}
		if(doClean && _target.length){
			for (var i = 0; i < _target.length; i++) {
				if (_target[i] == undefined) {         
					_target.splice(i, 1);
					i--;
				}
			}
		}
	}

	// TODO:- executeOnce is supposed to make function executable only once if
	// passed true, for all the changes for that key
	_instance_.sub = function(_KEY, fun, executeOnce, block) {
		var _KEYS = _KEY.split(',');
		var FUN = (!executeOnce ? fun.bind(this) : utils.execute.define(fun,
				this).prop('onOver', function() {
			for ( var i in this._KEYS) {
				delete this.event_map[this._KEYS[i]];
			}
		}).prop('_KEY', _KEYS));
		for ( var i in _KEYS)
			this._sub(_KEYS[i], FUN, executeOnce, block)
	};
	_instance_._sub = function(_KEY, FUN, executeOnce, block) {
		if (block)
			this.blockPath(_KEY);
		var key = this.refineKey(_KEY);
		var keys = key.split(/[#\.]+/gi);
		var ref = this.onchange_fun;
		var _nextKey = keys[0];
		var _key = keys[0];
		for (var i = 0; i < keys.length - 1; i++) {
			_key = keys[i];
			_nextKey = keys[i + 1];
			_atKey = '@' + _key;
			if (!ref[_atKey])
				ref[_atKey] = {
					key : _key,
					next : this.next,
					nextKey : _nextKey
				};
			ref = ref[_atKey];
		}
		ref['@' + _nextKey] = {
			// paths : [],
			key : _nextKey,
			next : FUN,
			nextKey : null,
			executeOnce : executeOnce,
			eventKey : _KEY
		};
	};

	// execute event handler
	_instance_._callFun = function(key, val) {
		var keys = key.split(/[#\.]+/gi);
		if (this.onchange_fun.next) {
			this.onchange_fun.next(new odo.dataEvent(0, keys, key, val),
					this.data, this);
		}
		// if (this.onchange_fun['@' + keys[0]]) {
		// this.onchange_fun['@' + keys[0]].next([], 0, keys);
		// }
	};

	_instance_.next = function(dEvent, __data, THIS) {
		var __key = dEvent.next();// [dEvent.index];
		var nextThis;
		if (this['@' + __key]) {
			//nextThis = this['@' + __key];
			_instance_.next_(this,this['@' + __key], __key, dEvent, __data, THIS);
			// return this['@' + __key].next(list, index + 1,
			// keys,e,THIS,__data)
		}  if (this['@*']) {
			dEvent.vars.push(__key);
			//nextThis = this['@*'];
			_instance_.next_(this,this['@*'], __key, dEvent, __data, THIS);
			// return this['@*'].next(list, index + 1, keys,e,THIS,__data);
		}  if (this['@#']) {
			dEvent.vars.push(__key);
			nextThis = this['@#'];
			_instance_.next_(this,this['@#'], __key, dEvent, __data, THIS);
			// return this['@#'].next(list, index + 1, keys,e,THIS,__data);
		}
		//_instance_.next_(this,nextThis, __key, dEvent, __data, THIS);
	};
	
	_instance_.next_ = function(THAT,nextThis,__key, dEvent, __data, THIS) {
		if (nextThis) {
			__data = __data ? __data[__key] : __data;
			// dEvent.index++;
			if (nextThis.executeOnce) {
				// dEvent.pop();
				var _dEvent = THIS.event_map[THAT.eventKey] || dEvent;
				THIS.event_map[THAT.eventKey] = _dEvent;
				_dEvent.merge(dEvent);
				nextThis.next.callOnce(dEvent, __data, THIS);
			} else {
				nextThis.next(dEvent, __data, THIS);
			}
		} else
			return null;
	};

	// Registers an event to be triggered
	_instance_.callFun = function(key, val) {
		this.onchange_map[key] = val;
		utils.executable.once.call(this, this.trigger.bind(this));
	};

	// process event queue
	_instance_.trigger = function() {
		for ( var key in this.onchange_map) {
			this._callFun(key, this.onchange_map[key]);
			delete this.onchange_map[key]
		}
		// delete refs...???
	};
});