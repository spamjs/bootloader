window.utils = function(utils){
	poly();
	var MODULE_CB = [];
	var MODULE_MAP = {};
	var MODULE_PENDING = {};
	
	utils.getAll = function(){
		return [MODULE_CB,MODULE_MAP,MODULE_PENDING]
	};
	
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
	var extendClass = function(defObj,fromString,dummyProto){
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
			MODULE_MAP[fromString]._def_(defObj,dummyProto);
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
		}
		cons.prototype.parent = function(fun){
			if(fun===undefined)
				return Object.getPrototypeOf(this);
			return Object.getPrototypeOf(this)[fun].bind(this);
		}
	};
	
	var getModule = function(classPath){
		return {
			module : classPath,
			_hasExtened_ : {},
			as : function(_def_){
				if(!this._def_ ){
					this._def_ = _def_;
					var _protos_ = {};
					this._def_(this,_protos_);
					if(!this._instance_) this._instance_ = function(){};
					if(typeof this._instance_ === 'function'){
						this._instance_.prototype = _protos_;
						extendProto(this._instance_,this._parent_);
					}
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
					extendClass(this,this._parent_,{});
				}
				return this;
			},
			parent : function(){
				return MODULE_MAP[this._parent_];
			},
			instance : function(a,b,c,d,e,f,g,h){
				if(this._instance_){
					var _instance_ = this._instance_;
					var newInst = new _instance_(a,b,c,d,e,f,g,h);
					if(newInst._create_) newInst._create_();
					return newInst;
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
	var CONTEXT_PATH = "/";
	var RESOURCE_PATH = "/res";
	var COMBINEJS = true;
	utils.getOneModule = function(module,path){
		utils.files.loadJS(path);
		return MODULE_MAP[module];
	};
	utils.getAllModule = function(module,path,mod_list,js_list){
		MODULE_PENDING[module] = module;
		mod_list.push(module);
		js_list.push(path);
	};
	utils.require = utils.loadModule = function(){
		if(arguments.length==1){
			var module = arguments[0];
			if(!MODULE_MAP[module]){
				var p = utils.files.resolve(module);
				if(!p){
					for(var i in DIR_MATCH){
						if(DIR_MATCH[i].reg.test(module)){
							return utils.getOneModule(module,RESOURCE_PATH+DIR_MATCH[i].dir+module+'.js');
						}
					}
				} else if(!MODULE_MAP[p.module]){
					return utils.getOneModule(p.module,p.url);
				} else return MODULE_MAP[p.module];
			} else return MODULE_MAP[module];
		} else if(arguments.length>1){
			var js_list = [];
			var mod_list = [];
			for (var j = 0; j < arguments.length; j++) {
				var module = arguments[j];
				if(!MODULE_MAP[module]){
					var p = utils.files.resolve(module);
					if(!p){
						for(var i in DIR_MATCH){
							if(DIR_MATCH[i].reg.test(module)){
								utils.getAllModule(module,RESOURCE_PATH+DIR_MATCH[i].dir+module+'.js',
										mod_list,js_list);
							}
						}
					} else if(!MODULE_MAP[p.module]){
						utils.getAllModule(p.module,p.url,mod_list,js_list);
					}
				}
			}
			var RETMODULE = [],_args = arguments;
			utils.files.loadJS.call(utils.files,js_list,function(){
				for(var i in mod_list){
					delete MODULE_PENDING[mod_list[i]];
				}
				var _MODULE_CB = MODULE_CB;
				MODULE_CB = []
				for(var i in _MODULE_CB){
					_MODULE_CB[i]();
    	    	}
				for(var i in _args){
					RETMODULE.push(MODULE_MAP[_args[i]]);
				}
				for(var i in mod_list){
					if(!MODULE_MAP[mod_list[i]]){
						console.warn(mod_list[i],'is not registered module');
					};
				}
			});
			return RETMODULE;
		}
	};
	var createPackList = function(pack,from,to){
		if(!from[pack]) return to;
		for(var i in from[pack]['@']){
			createPackList(from[pack]['@'][i],from,to);
		}
		return to.concat(from[pack]['files'])
	};
	utils.resolvePack = function(packs){
		var files = [];
		for(var pack in packs){
			files = createPackList(pack,packs,files);
		}
		utils.require.apply(utils,files)
	};
	utils.loadPackage = function(pack){
		utils.files.load('some.js?$='+Array.prototype.slice.call(arguments).join(','));
	};
	utils.files = function(files) {
	    files.loaded_js = [];
	    files.setContext = function(context){
	    	this.context = context;
	    };
	    files.resolve = function(path){
	    	if(!path.endsWith('.js') && !path.endsWith('.css')) 
	    		path = path+'.js';
	    	var p = path.split('/');
	    	var url = false;
	    	if(p.length>1){
	    		if(p[0]=='') url = (CONTEXT_PATH + path.slice(1));
	    		else url = (RESOURCE_PATH + path);
	    	} else return false;
	    	return { url : url, module : p[p.length-1].replace(/([\w]+)\.js$|.css$/, "$1")}
	    };
	    files.setResourcePath = function(path){
	    	this.rpath = path;
	    };
	    files.loadJS = function(js){
	    	files.load(RESOURCE_PATH  + js);
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
	
	var trimSlashes = function(str){
		return str.replace(/(^\/)|(\/$)/g, "");
	};
	
	utils.config = function(_config){
		_config.set = function(config){
			CONTEXT_PATH = config.contextPath ? ("/"+trimSlashes(config.contextPath) + "/") : CONTEXT_PATH;
			RESOURCE_PATH =  (config.contextPath && config.resourcePath)
								? ('/' + trimSlashes(config.contextPath) 
										+ '/' +trimSlashes(config.resourcePath) + '/') 
								: RESOURCE_PATH;
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
	//utils.ready(function(){
		var scripts = document.getElementsByTagName('script');
		for(var i in scripts){
			var p = utils.files.resolve(scripts[i].src || "");
			if(p){
				console.log(p.module);
				MODULE_MAP[p.module] = MODULE_MAP[p.module] || {};
			}
		}
	//});
	return utils;
}({});
function poly(){
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
		if (typeof String.prototype.endsWith !== 'function') {
		    String.prototype.endsWith = function(suffix) {
		        return this.indexOf(suffix, this.length - suffix.length) !== -1;
		    };
		}	
}