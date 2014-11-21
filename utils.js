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
					return extendClass(defObj,fromString,dummyProto);
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
				extendClass(defObj,MODULE_MAP[fromString]._parent_,dummyProto);
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
			//console.info(utils.status.start(),'extendProto',fromString)
			cons.prototype = MODULE_MAP[fromString].instance();
			//console.info(utils.status.done(),'extendProtoDone',fromString)
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
					//console.info(utils.status.start(),"ASTART",this.module,this._parent_,_protos_)
					try	{
						this._def_(this,_protos_);
					} catch (e){
						console.warn(this.module,e);
					}
					if(!this._instance_) this._instance_ = function(){
						console.info('no function...')
					};
					if(typeof this._instance_ === 'function'){
						this._instance_.prototype = _protos_;
						//console.info(utils.status.start(),"xpro",this.module,this._parent_)
						extendProto(this._instance_,this._parent_);
						//console.info(utils.status.done(),"xpro",this.module,this._parent_)
					}
					if(this._execute_) this._execute_();
					if(this._ready_){
						var that = this;
						utils.ready(function(){
							try{
								if(that._ready_) that._ready_();
							} catch (e){
								console.error(that.module+"._ready_:exception ",e);
							}
						});
					}
					//console.info(utils.status.done(),"ASDONE",this.module,this._parent_)
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
				//console.info(utils.status.start(),'.instance...',this.module,a,b,c,d,e,f,g,h);
				if(this._instance_){
					var __instance__ = this._instance_;
					//console.info(utils.status.start(),'_instance_Exists',__instance__);
					try{
						//console.info(utils.status.start(),this.module,'NEW_instance_Start',__instance__);
						var newInst = new __instance__(a,b,c,d,e,f,g,h);
						//console.info(utils.status.done(),this.module,'NEW_instance_Ends',__instance__);
						if(newInst._create_) newInst._create_();
						return newInst;
					} catch (e){
						console.error(this.module+"._instance_:exception ",e);
					}
					//console.info(utils.status.done(),'_instance_Exists',__instance__);
				}
				//console.info(utils.status.done(),'.instance...',this.module,a,b,c,d,e,f,g,h);
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
		//console.info(classPath,asFun)
		try{
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
				if(MODULE_MAP[classPath] && asFun && typeof asFun == 'function'){
					MODULE_MAP[classPath].as(asFun);
					//console.log('classPath',classPath)
				}
				//console.info('returning',classPath)
				return MODULE_MAP[classPath] ;
			} else if(typeof classPath=='function'){
				return getModule('anonymous').as(classPath);
			}
		} catch (e){
			console.error("e",e);
		}
	};
	
	var DIR_MATCH = {};
	var CONTEXT_PATH = "/";
	var RESOURCE_PATH = "/res";
	var COMBINEJS = true;
	utils._FILES_ = {};
	
	utils.getOneModule = function(module,path){
		utils.files.loadFiles(utils.url.clean(path));
		//console.log(module,path,MODULE_MAP);
		return MODULE_MAP[module];
	};
	utils.getAllModule = function(module,path,mod_list,js_list){
		MODULE_PENDING[module] = module;
		mod_list.push(module);
		js_list.push(utils.url.clean(path));
	};
	utils.require = utils.loadModule = function(){
		var _mods_ = [], _bundles_ = [];
		for (var j = 0; j < arguments.length; j++){
			if(arguments[j].indexOf(":")==0){
				_bundles_.push(arguments[j].substr(1));
			} else {
				_mods_.push(arguments[j])
			}
		}
		if(_bundles_.length>0){
			utils.loadBundle.apply(this,_bundles_);
		}
		if(_mods_.length==1){
			var module = _mods_[0];
			if(!MODULE_MAP[module]){
				var p = utils.files.resolve(module);
				if(!p){
					for(var i in DIR_MATCH){
						if(DIR_MATCH[i].reg.test(module)){
							return utils.getOneModule(module,RESOURCE_PATH+DIR_MATCH[i].dir+module+'.js');
						}
					}
					return utils.getOneModule(module,RESOURCE_PATH+module+'.js');
				} else if(!MODULE_MAP[p.module]){
					return utils.getOneModule(p.module,p.url);
				} else return MODULE_MAP[p.module];
			} else return MODULE_MAP[module];
		} else if(_mods_.length>1){
			var js_list = [];
			var mod_list = [];
			for (var j = 0; j < _mods_.length; j++) {
				var module = _mods_[j];
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
			utils.files.loadFiles.call(utils.files,js_list,function(){
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
		utils.require.apply(this,files)
	};
	utils.loadBundle = utils.loadPackage = function(pack){
		//TODO:- load packs which are not loaded
		utils.files.loadJSFile('bundle.js?$='+Array.prototype.slice.call(arguments).join(','));
	};
	utils.files = function(files) {
	    files.loaded_js = [];
	    files.setContext = function(context){
	    	this.context = context;
	    };
	    files.resolve = function(path){
	    	var isJS = path.endsWith('.js');
	    	var isCSS = path.endsWith('.css');
	    	if(!isJS && !isCSS) 
	    		path = path+'.js';
	    	var p = path.split('/');
	    	var url = false;
	    	if(p.length>1){
	    		if(p[0]=='') url = (CONTEXT_PATH + path.slice(1));
	    		else url = (RESOURCE_PATH + path);
	    	} else return false;
	    	return { url : url, module : p[p.length-1].replace(/([\w]+)\.js$|.css$/, "$1"),
	    		isJS : isJS, isCSS : isCSS }
	    };
	    files.setResourcePath = function(path){
	    	this.rpath = path;
	    };
	    files.loadJSFile = function(js){
	        $('head').append('<script src="' + js + '" type="text/javascript"></script>');
	    };
	    files.loadCSSFile = function(css){
	        $('head').append('<link href="' + css + '" type="text/css" rel=stylesheet></link>');
	    };
	    files.loadFiles = function() {
	    	var args, jslist=[],csslist=[],cb;
	    	if(typeof arguments[0] === 'string'){
	    		args = arguments;
	    	} else if($.isArray(arguments[0])){
	    		args = arguments[0];
	    		if(arguments[1] && typeof arguments[1]=='function'){
	    			cb = arguments[1];
	    		}
	    	}
	    	for (var j = 0; j < args.length; j++){
	    		if(!utils._FILES_[args[j]]){
	    			if(args[j].endsWith('.css'))
	    				csslist.push(args[j]);
	    			else jslist.push(args[j]);
	    		}
	    	}
	    	files.loadJs(jslist,cb);
	    	files.loadCss(csslist,cb);
	    };
	    files.loadJs = function(list,cb){
	    	if(COMBINEJS && list.length){
	    		$.ajax({
	    			async: false,
	    			url: RESOURCE_PATH + 'combine.js?@='+list.join(','),
	    			dataType: "script",
	    			cache : true,
	    			complete : function(){
	    				for(var i in list){
	    					utils._FILES_[list[i]] = list[i];
	    				}
	    				if(cb) cb();
	    			}
	    		});
	    	} else {
	    		for(var i in list){
	    			files.loadJSFile(list[i]);
	    			utils._FILES_[list[i]] = list[i];
	    		}
	    	} 
	    };
	    files.loadCss = function(list,cb){
	    	if(COMBINEJS && list.length){
	    		$.ajax({
	    			async: true,
	    			url: RESOURCE_PATH + 'combine.css?@='+list.join(','),
	    			//dataType: "script",
	    			complete : function(){
	    				for(var i in list){
	    					utils._FILES_[list[i]] = list[i];
	    				}
	    				if(cb) cb();
	    			}
	    		});
	    	} else {
	    		for(var i in list){
	    			files.loadCSSFile(list[i]);
	    			utils._FILES_[list[i]] = list[i];
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
			config.contextPath = CONTEXT_PATH;
			delete _config.moduleDir;
			for(var i in config){
				_config[i]= config[i];
			}
		}
		return _config;
	}({});
	utils.status = {
			me  : "=",
			start : function(){ var x =this.me; this.me+="="; return x;},
			done : function(){ this.me = this.me.replace('=','');return this.me;}
	}
	utils.ready = function(cb){
		return $(document).ready(cb);
	}
	//utils.ready(function(){
		var scripts = document.getElementsByTagName('script');
		for(var i in scripts){
			var p = utils.files.resolve(scripts[i].src || "");
			if(p){
				//console.log(p.module);
				var cleanSRC = scripts[i].src.replace(document.location.origin,'')
				utils._FILES_[cleanSRC] = cleanSRC
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

utils.define('utils.url', function(url) {
	url.getParam = function (name,_url) {
	    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
	    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
	        results = regex.exec(_url || location.search);
	    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
	};
	url.getValueAtIndex = function (index) {
		var data = window.location.pathname.split("/");
		return (data[index]);
	};
	url.push = function(pageData, pageTitle, pageUrl){
		console.info("pushState",pageData,pageUrl);
		return window.history.pushState(pageData || null, pageTitle || null, pageUrl);
	};
	url.clean = function(url){
		var ars = url.split('/');
		var domain = ars.shift();
		var parents = [];
		for( var i in ars) {
		    switch(ars[i]) {
		        case '.':
		        // Don't need to do anything here
		        break;
		        case '..':
		        	parents.pop()
		        break;
		        default:
		        	parents.push(ars[i]);
		        break;
		    }
		}
		return domain +  '/'  + parents.join( '/');
	};
});
