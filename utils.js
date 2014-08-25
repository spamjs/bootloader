window.utils = function(utils){

	var MODULE_CB = [];
	var MODULE_MAP = {};
	var MODULE_PENDING = {};
	
	/**
	 *  extendClass extends the Module from given parent Class name,
	 *  if parent Module name does not exists it will load the definition 
	 *  from server and if not found after that, it will throw an Exception.
	 *  
	 *  It can be extended (try again) from same module again. 
	 *  A module cannot be extended twice from same module, it will throw an Exception
	 *  while doing so.
	 *  
	 *  @param defObj
	 *  		Module to be extended
	 *  @param fromString
	 *  		Parent module name
	 */
	var extendClass = function(defObj,fromString){
		if(defObj._hasExtened_[fromString]) return defObj;
		if(!MODULE_MAP[fromString]){
			if(true && MODULE_PENDING[fromString]){
				MODULE_CB.push(function(){
					return extendClass(defObj,fromString);
				})
				defObj.waiting = true;
				return defObj;
			} else{
				defObj.waiting = false;
				utils.loadModule(fromString);
			}
		}
		if(MODULE_MAP[fromString] && MODULE_MAP[fromString]._def_){
			if(MODULE_MAP[fromString]._parent_){
				extendClass(defObj,MODULE_MAP[fromString]._parent_);
			}
			MODULE_MAP[fromString]._def_(defObj);
			defObj._hasExtened_[fromString] = true;
		} else {
			delete MODULE_MAP[fromString];
			throw new Error("parent module missing : " + fromString)	
		}
		return defObj;
	};
	
	var extendProto = function(cons,fromString){
		if(MODULE_MAP[fromString] && MODULE_MAP[fromString]._instance_){
			var _proto_ = cons.prototype;
			cons.prototype = MODULE_MAP[fromString].instance();
			for(var prop in _proto_){
				cons.prototype[prop] = _proto_[prop];
			}
			cons.prototype.parent = function(fun){
				if(fun===undefined)
					return Object.getPrototypeOf(this);
				return Object.getPrototypeOf(this)[fun].bind(this);
			}
		}
	};
	
	var getModule = function(classPath){
		return {
			module : classPath,
			_hasExtened_ : {},
			as : function(_def_){
				if(!this._def_ ){
					this._def_ = _def_;
					this._def_(this);
					if(!this._instance_) this._instance_ = function(){};
					if(typeof this._instance_ === 'function'){
						extendProto(this._instance_,this._parent_);
					}
					console.log('defined::',this.module)
					if(this._execute_) this._execute_();
					var that = this;
					utils.ready(function(){
						if(that._ready_) that._ready_();
					});
				} else throw new Error('module can have only one definition')
				return this;
			},
			extend : function(_parent_){
				if(!this._parent_){
					this._parent_ = _parent_;
					extendClass(this,this._parent_);
				}
				return this;
			},
			parent : function(){
				return MODULE_MAP[this._parent_];
			},
			instance : function(a,b,c,d,e,f,g,h){
				if(this._instance_){
					var _instance_ = this._instance_;
					return new _instance_(a,b,c,d,e,f,g,h);
				}
			}
		};
	}
	
	utils.extend = function(fromString){
		return utils.define().extend(fromString);
	};
	
	utils.module = function(classPath){
		if(MODULE_MAP[classPath]) return MODULE_MAP[classPath];
		else return utils.require(classPath);
	};
	
	utils.define = function(classPath,asFun){
		if(!classPath){
			/**
			 * If classPath is not given then 'anonymous' module should be created
			 * and returned to caller, it will not have
			 * any global identity, referring to it.
			 */
			return getModule('anonymous');
			
		} else if(typeof classPath=='string'){
			/**
			 * If classPath is given and is actually a package name then
			 * module is created in global namespace and returned to caller.
			 */
			if(!MODULE_MAP[classPath] || !MODULE_MAP[classPath]._def_) {
				var nspace = classPath.split('.');
				var win = window;
				var retspace = nspace[0];
				for(var i =0; i<nspace.length-1; i++){
					if (!win[nspace[i]]) win[nspace[i]] = {};
					retspace = nspace[i];
					win = win[retspace];
				}
				MODULE_MAP[classPath] = win[nspace[nspace.length-1]] = getModule(classPath);
			} //else throw new Error("Cannot redefine "+classPath + " as it already exists");
			if(MODULE_MAP[classPath] && asFun && typeof asFun == 'function')
				return MODULE_MAP[classPath].as(asFun)
			return MODULE_MAP[classPath] ;
		} else if(typeof classPath=='function'){
			return getModule('anonymous').as(classPath);
		}
	};
	
	var DIR_MATCH = {};
	var BASE_URL = "/res/";
	var COMBINEJS = true;
	utils.require = utils.loadModule = function(){
		if(arguments.length==1){
			var module = arguments[0];
			if(!MODULE_MAP[module]){
				for(var i in DIR_MATCH){
					if(DIR_MATCH[i].reg.test(module)){
						utils.files.loadJS(BASE_URL+DIR_MATCH[i].dir+module+'.js');
						return MODULE_MAP[module];
					}
				}
			} else return MODULE_MAP[module];
		} else if(arguments.length>1){
			var js_list = [];
			var mod_list = [];
			for (var j = 0; j < arguments.length; j++) {
				var module = arguments[j];
				if(!MODULE_MAP[module]){
					for(var i in DIR_MATCH){
						if(DIR_MATCH[i].reg.test(module)){
							MODULE_PENDING[module] = module;
							mod_list.push(module);
							js_list.push(BASE_URL+DIR_MATCH[i].dir+module+'.js');
						}
					}
				}
			}
			utils.files.loadJS.call(utils.files,js_list,function(){
				for(var i in mod_list){
					delete MODULE_PENDING[mod_list[i]];
				}
				var _MODULE_CB = MODULE_CB;
				MODULE_CB = []
				for(var i in _MODULE_CB){
					_MODULE_CB[i]();
    	    	}
			});
		}
	};
	utils.files = function(files) {
	    files.loaded_js = [];
	    files.setContext = function(context){
	    	this.context = context;
	    };
	    files.setResourcePath = function(path){
	    	this.rpath = path;
	    };
	    files.loadJS = function(js){
	    	files.load(BASE_URL  + js);
	    };
	    files.load = function(js){
	        $('head').append('<script src="' + js + '" type="text/javascript"></script>');
	    };
	    files.loadJS = function() {
	    	var file,list=[],cb;
	    	var first = arguments[0];
	    	if(typeof first === 'string'){
	    		file = first;
	    		for (var j = 1; j < arguments.length; j++){
    				list.push(arguments[j]);
    			}
	    	} else if($.isArray(arguments[0])){
	    		file = arguments[0][0];
	    		arguments[0].splice(0,1);
	    		list = arguments[0];
	    		if(arguments[1] && typeof arguments[1]=='function'){
	    			cb = arguments[1];
	    		}
	    	}
	    	if(COMBINEJS){
	    		$.ajax({
	    			async: false,
	    			url: file+'?@='+list.join(','),
	    			dataType: "script",
	    			complete : function(){
	    				return cb && cb();
	    			}
	    		});
	    	} else {
	    		files.load(file);
	    		for(var i in list){
	    			files.load(list[i]);
	    		}
	    	} 
	    };
	    return files;
	}({});
	
	utils.config = function(_config){
		_config.set = function(config){
			BASE_URL =  config.baseUrl || BASE_URL;
			COMBINEJS = (config.combine!=undefined) ? config.combine : COMBINEJS;
			if(config.moduleDir){
				for(var reg in config.moduleDir){
					DIR_MATCH[reg] = {
							reg : new RegExp(reg.replace('\.',"\\.",'g').replace('*','\\.*','g')),
							dir : config.moduleDir[reg]
					}
				}
			}
			delete _config.moduleDir;
			for(var i in config){
				_config[i]= config[i];
			}
		}
		return _config;
	}({});
	utils.ready = function(cb){
		return $(document).ready(cb);
	}
	return utils;
}({});

if ( typeof Object.getPrototypeOf !== "function" ) {
  if ( typeof "test".__proto__ === "object" ) {
    Object.getPrototypeOf = function(object){
      return object.__proto__;
    };
  } else {
    Object.getPrototypeOf = function(object){
      return object.constructor.prototype;
    };
  }
}