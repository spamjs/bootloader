window.utils = function(root){
	var utils = root.utils || {};

	if(utils.__INTIALIZED__){
		return utils //throw "ALREADY INTIALIZED";
	}
	utils.__INTIALIZED__ = true;
	console.info("__INTIALIZING__");
	var $ = jQuery;

	var MODULE_CB = [];
	var MODULE_MAP = {},PROXY_MAP = {};
	var MODULE_PENDING = {};
	var CONTEXT_PATH = "/";
	
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
		if(MODULE_MAP[fromString] && MODULE_MAP[fromString]._definition_){
			if(Object.setPrototypeOf){
				Object.setPrototypeOf(defObj, MODULE_MAP[fromString]);
			} else {
				if(MODULE_MAP[fromString]._parent_){
					extendClass(defObj,MODULE_MAP[fromString]._parent_,dummyProto);
				}
				MODULE_MAP[fromString]._definition_(defObj,dummyProto);
			}
			defObj._hasExtened_[fromString] = true;
		} else {
			delete MODULE_MAP[fromString];
			throw new Error("parent module missing : " + fromString)	
		}
		return defObj;
	};
	
	var AbstractModule = utils.AbstractModule = function AbstractModule(){
		
	};
	AbstractModule.prototype.parent = function(fun){
		if(fun===undefined)
			return Object.getPrototypeOf(this);
		return Object.getPrototypeOf(this)[fun].bind(this);
	};
	
	var getPrototype = function(fromString){
		if(MODULE_MAP[fromString] && MODULE_MAP[fromString]._instance_){
			return MODULE_MAP[fromString].instance();
		} else {
			return new AbstractModule();
		}
	};
	
	var mixin = function(source) {
		for (var k in source) {
			if (source.hasOwnProperty(k)) {
				this[k] = source[k];
			}
		}
		return this; 
	};
	
	var selectNameSpace = function(nameSpace,valObj){
		var nspace = nameSpace.split('.');
		var win = window;
		var retspace = nspace[0];
		for(var i =0; i<nspace.length-1; i++){
			if (!win[nspace[i]]) win[nspace[i]] = {};
			retspace = nspace[i];
			win = win[retspace];
		}
		return win[nspace[nspace.length-1]] = valObj;
	}
	
	//CLASS PATH HAS BEEN MOVED TO NEW MODUEL
	var ClassPath = function ClassPath(_dir_,_file_,data){
		this._dir_ = _dir_;
		this._file_ = _file_ || "";
		this._file_path_ = utils.url.resolve(this._file_,this._dir_);
		this._resolved_path_ = this._dir_;
		this._data_ = data;
	};
	ClassPath.prototype.get = function(cb){
		 this.load(this._data_).done(cb);
		 return this;
	};
	ClassPath.prototype.load = function(data){
		return utils.files.get(this._file_path_,data || this._data_);
	};
	ClassPath.prototype.toString = function(){
		return this._file_path_;
	};
	ClassPath.prototype.resetPath = function(){
		this._file_path_;
		var dirs = this._file_path_.split('/');
		dirs.pop();
		this._resolved_path_ = dirs.join('/');
		return this;
	};
	ClassPath.prototype._type_ = ClassPath.name;
	
	utils.getClassPath = function (_dir_,_file_,data){
		return new ClassPath(_dir_,_file_,data);
	}
	
	var ModuleClass = function ModuleClass (moduleName){
		this.module = moduleName;
		this._hasExtened_ = {};
	};
	ModuleClass.prototype.as = function(_definition_){
		if(!this.hasOwnProperty('_definition_') ){
			var self = this;
			this._definition_ = _definition_;
			if(utils.config && utils.config.get && utils.config.get().load_all_modules){
				var matches = _definition_.toString().match(/utils\.module\(([^)]+)*\)/g);
				if(matches){
					var reqModules = matches.map(function(mod){
						return mod.replace(/utils\.module\(|\"|\'|\)/g,"");
					});
					utils.require.apply(utils,reqModules);
				}
			}
			//Prepraring Prototype
			var _protos_ = getPrototype(this._parent_);
			//console.info(utils.status.start(),"ASTART",this.module,this._parent_,_protos_)
			try	{
				if(this.parent()!==undefined && this.parent()._extend_){
					this.parent()._extend_(this,_protos_);
				} else {
					this._definition_.call(root,this,_protos_);
				}
			} catch (e){
				console.warn(this.module,e);
			}
			this.proto_object = _protos_;
			this.proto_object.getClass = function(){
				return self;
			};
			if(false && typeof this._instance_ === 'function'){
				this._instance_.prototype = _protos_;
				//Additional Functions
				this._instance_.prototype.getClass = function(){
					return self;
				};
			}
			if(this._execute_) this._execute_();
			if(this.parent()!==undefined && this.parent()._extended_){
				this.parent()._extended_(this,this.proto_object);
			}
			if(this._config_ && utils.config){
				this._config_(utils.config.getModuleConfig(this.module),utils.config.get())
			}
			if(this._define_) this._define_();
			if(this._ready_){
				utils.ready(function(){
					try{
						if(self._ready_) self._ready_();
					} catch (e){
						console.error(self.module+"._ready_:exception ",e);
					}
				});
			}
			//console.info(utils.status.done(),"ASDONE",this.module,this._parent_)
		} else {
			throw new Error("Module Definition " + this.module + ' already Exists ' 
					+ 'module can have only one definition')
		}
		return this;
	};
	
	ModuleClass.prototype.extend = function(_parent_){
		if(!this._parent_){
			this._parent_ = _parent_;
			extendClass(this,this._parent_,{});
		}
		return this;
	};
	
	ModuleClass.prototype.parent = function(){
		return MODULE_MAP[this._parent_];
	};
	ModuleClass.prototype.instance = function(a,b,c,d,e,f,g,h){
		if(this._instance_){
			var __instance__ = this._instance_;
			try{
				var newInst = Object.create(this.proto_object);
				this._instance_.call(newInst,a,b,c,d,e,f,g,h);
				if(newInst._create_) newInst._create_();
				return newInst;
			} catch (e){
				console.error(this.module+"._instance_:exception ",e);
			}
		}
	};
	ModuleClass.prototype.requires = function(){
		
	};
	ModuleClass.prototype.getPath = function(_file_,data){
		return new ClassPath(this._dir_,_file_,data);
	};
	ModuleClass.prototype.getContextPath = function(_file_,data){
		return new ClassPath(utils.config.get().contextPath,_file_,data);
	};
	ModuleClass.prototype.mixin = mixin;
	
	utils.getContextPath = ModuleClass.prototype.getContextPath;
	utils.extend = function(fromString){
		return utils.define().extend(fromString);
	};
	utils.intercept = function(classPath){
		return utils.proxy().intercept(classPath);
	};
	
	var ProxyClass = function ProxyClass(moduleName){
		this.module = moduleName;
	};
	ProxyClass.prototype.intercept = function(toClass){
		utils.loadModule(toClass);
		this._intercept_ = toClass;
		MODULE_MAP[this.module] = MODULE_MAP[this._intercept_]
		return this;
	};
	ProxyClass.prototype.as = function(cb){
		cb(MODULE_MAP[this._intercept_],MODULE_MAP[this._intercept_].proto_object,this);
		if(this._config_ && utils.config){
			this._config_(utils.config.getModuleConfig(this.module),utils.config.get())
		}
		return  this;
	};

	 /**
	  * function define(moduleName,moduleDef) 
	  * @memberOf   utils
	  * @param   {String} moduleName
	  * @param   {Function} moduleDef
	  * @returns {ModuleClass}
	  * @see     Object
	  * @since   Standard ECMA-262 3rd. Edition 
	 */ 
	utils.define = function(classPath,asFun){
		try{
			if(!classPath){
				/**
				 * If classPath is not given then 'anonymous' module should be created
				 * and returned to caller, it will not have
				 * any global identity, referring to it.
				 */
				return new ModuleClass('anonymous');
				
			} else if(typeof classPath=='string'){
				/**
				 * If classPath is given and is actually a package name then
				 * module is created in global namespace and returned to caller.
				 */
				if(!MODULE_MAP[classPath] || !MODULE_MAP[classPath]._definition_) {
					/*
					var nspace = classPath.split('.');
					var win = window;
					var retspace = nspace[0];
					for(var i =0; i<nspace.length-1; i++){
						if (!win[nspace[i]]) win[nspace[i]] = {};
						retspace = nspace[i];
						win = win[retspace];
					}
					MODULE_MAP[classPath] = win[nspace[nspace.length-1]] = new ModuleClass(classPath);
					*/
					MODULE_MAP[classPath] = selectNameSpace(classPath,new ModuleClass(classPath));
				} //else throw new Error("Cannot redefine "+classPath + " as it already exists");
				if(MODULE_MAP[classPath] && asFun && typeof asFun == 'function'){
					MODULE_MAP[classPath].as(asFun);
				}
				return MODULE_MAP[classPath] ;
			} else if(typeof classPath=='function'){
				return (new ModuleClass('anonymous')).as(classPath);
			}
		} catch (e){
			console.error("e",e);
		}
	};
	
	utils.proxy = function(classPath){
		if(!classPath){
			return new ProxyClass('anonymous');
		} else {
			return PROXY_MAP[classPath] = selectNameSpace(classPath,new ProxyClass(classPath));
		}
	};
	
	var createPackList = function(pack,from,to){
		if(!from[pack]) return to;
		for(var i in from[pack]['@']){
			to = createPackList(from[pack]['@'][i],from,to);
		}
		if(to && from[pack]['files'] && from[pack]['files'].length)
			return to.concat(from[pack]['files']);
		else return to;
	};
	utils.resolvePack = utils.updateBundle = function(packs){
		return utils.files.update(packs);
	};
	utils.loadBundle = utils.loadPackage = function(pack){
		var pack_list = [];
		for(var i = 0; i < arguments.length; i++){
			if(!utils.files.BUNDLES[arguments[i]]){
				pack_list.push(arguments[i]);	
			}
		}
		if(pack_list.length && utils.config.get().resolve_bundles){
			utils.files.loadJSFile('resources.json?cb=utils.updateBundle&$='
					+pack_list.join(','));
		}
		var files = [];
		for(var i = 0; i < arguments.length; i++){
			if(utils.files.BUNDLES[arguments[i]]){
				files = createPackList(arguments[i],utils.files.BUNDLES,files);	
			}
		}
		utils.require.apply(this,files);
	};
	
	utils._module =  utils.module = function(classPath){
		if(!MODULE_MAP[classPath]){
			var info = utils.files.getInfo(classPath);
			if(!MODULE_MAP[info.module]){
				utils.require(classPath);				
			}
			return MODULE_MAP[info.module];
		}
		return MODULE_MAP[classPath];
	};
	
	utils.require = utils.loadModule = function(){
		var _mods_ = [], _bundles_ = [];
		for (var j = 0; j < arguments.length; j++){
			if(arguments[j]){
				if(arguments[j].indexOf(":")==0){
					_bundles_.push(arguments[j].substr(1));
					_mods_.push(null);
				} else {
					_mods_.push(arguments[j])
				}
			}
		}
		if(_bundles_.length>0){
			var files = utils.loadBundle.apply(this,_bundles_);
		}
		var js_list = []; //Files to be fetched
		var mod_list = []; //Modules to be downloaded
		for (var j = 0; j < _mods_.length; j++) {
			var module = _mods_[j];
			if(module && !MODULE_MAP[module]){
				var p = utils.files.getInfo(module);
				MODULE_PENDING[p.module] = p.module;
				_mods_[j] = p.module;
				mod_list.push(p);
				js_list.push(p.url);
			}
		}
		var RETMODULE = [],_args = _mods_;
		utils.files.loadFiles.call(utils.files,js_list,function(){
			for(var i in mod_list){
				delete MODULE_PENDING[mod_list[i].module];
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
				if(!MODULE_MAP[mod_list[i].module]){
					console.warn(mod_list[i],'is not registered module');
				} else {
					MODULE_MAP[mod_list[i].module]._dir_ = mod_list[i].dir;
				}
			}
		});
		return RETMODULE;
	};

	utils.status = {
			me  : "=",
			start : function(){ var x =this.me; this.me+="="; return x;},
			done : function(){ this.me = this.me.replace('=','');return this.me;}
	}
	var _READY_ = $.Deferred();
	utils.ready = function(cb){
		_READY_.promise().done(cb)
	};
	utils.scan_scripts = function(){
		var scripts = document.getElementsByTagName('script');
		for(var i=0; i<scripts.length;i++){
			if(!scripts[i].loaded){
				if(scripts[i].src && !scripts[i].getAttribute('loaded')){
					var srcs = [];
					if(scripts[i].src.indexOf("@=")>-1){
						srcs = scripts[i].src.split("@=")[1];
						srcs = srcs.split(",");
					} else {
						srcs = [scripts[i].src];
					}
					srcs.map(function(src){
						var p = utils.files.getInfo((src).replace(document.location.origin,''));
						var cleanSRC = p.url.replace(document.location.origin,'');
						utils.files.LOADED[cleanSRC] = cleanSRC
						MODULE_MAP[p.module] = MODULE_MAP[p.module] || (!MODULE_PENDING[p.module] ? {} : null);
						if(MODULE_MAP[p.module]){
							MODULE_MAP[p.module]._dir_ = p.dir;
						} else {
							console.error("MODULE_INDEX_EXCEPTION: ",p.module)
						}
					});
				}
			}
		}
	}
	utils.ready(utils.scan_scripts);
	
	$(document).ready(function(){
		_READY_.resolve();
	});
	utils.on_config_ready = function(){
		if(utils.config.get().bundles!==undefined){
			if(utils.config.get().bundles.endsWith('.json')){
				$.ajax({
					  url: utils.config.get().bundles,
					  dataType: 'json',
					  async: false,
					  cache : true,
					  success: function(resp) {
							utils.updateBundle(resp.bundles);
					  }
				});
			} else utils.files.loadJSFile(utils.config.get().bundles)
		}
		utils.scan_scripts();
	};
	return utils;
}(this);

utils.define('utils.config', function(config) {
	var CONFIG = {};
	CONFIG.combine = true;
	var trimSlashes = function(str){
		return str.replace(/(^\/)|(\/$)/g, "");
	};
	CONFIG.ajaxPrefilter = function(options, originalOptions, jqXHR) {
		if (options.dataType == 'script' || originalOptions.dataType == 'script') {
			options.cache = true;
		}
	};
	config.set = function(options){
		CONFIG.moduleConfig = options.moduleConfig || {};
		console.info("setting configuration...");
		CONTEXT_PATH = options.contextPath ? ("/"+trimSlashes(options.contextPath) + "/") : CONTEXT_PATH;
		CONFIG.RESOURCE_PATH =  (options.contextPath && options.resourcePath)
							? ('/' + trimSlashes(options.contextPath) 
									+ '/' +trimSlashes(options.resourcePath) + '/') 
							: options.RESOURCE_PATH;
		CONFIG.combine = (options.combine!=undefined) ? options.combine : CONFIG.combine;
		if(options.moduleDir){
			for(var reg in options.moduleDir){
				utils.files.DIR_MATCH[reg] = {
						reg : new RegExp(reg.replace('\.',"\\.",'g').replace('*','\\.*','g')),
						dir : options.moduleDir[reg]
				}
			}
		}
		CONFIG.resolve_bundles = (options.resolve_bundles===undefined) || options.resolve_bundles;
		options.contextPath = CONTEXT_PATH;
		delete options.moduleDir;
		for(var i in options){
			CONFIG[i]= options[i];
		}
		CONFIG.bundles = options.bundle_list || options.bundles;
		$.ajaxPrefilter(CONFIG.ajaxPrefilter);
		utils.on_config_ready();
	};
	config.get = function(moduleName){
		if(moduleName === undefined) return CONFIG;
		return CONFIG[moduleName] || {};
	};
	config.getModuleConfig = function(moduleName){
		return CONFIG.moduleConfig[moduleName] || {};
	};
});
utils.define('utils.files', function(files) {
	var CONFIG = utils.config.get();
	files.MODULES = {};
	files.LOADED = {};
	files.LOADING = {};
	files.BUNDLES = {};
    files.DIR_MATCH = {};
    files.script_rendered = false;
    
	files.update = function(packs){
		for(var pack in packs){
			if(!files.BUNDLES[pack]){
				this.BUNDLES[pack] = packs[pack];
				for(var i in files.BUNDLES[pack].files){
					var p = files.getInfo(this.BUNDLES[pack].files[i]);
					if(p && p.isJS){
						files.MODULES[p.module] = p;
					}
				}
			}
		}
	};
	
	files.dirMatch = function(module){
		for(var i in this.DIR_MATCH){
			if(this.DIR_MATCH[i].reg.test(module)){
				return this.DIR_MATCH[i].dir + module
			}
		} return module;
	}
    files.getInfo = function(_path){
    	if(files.MODULES[_path]) {
    		return files.MODULES[_path];
    	}
    	var path = _path.split("?")[0];
    	var isJS = path.endsWith('.js');
    	var isCSS = path.endsWith('.css');
    	if(!isJS && !isCSS) {
    		path = path+'.js';
    		isJS = true;
    	}
    	var info = utils.url.info(path,CONFIG.contextPath,CONFIG.resourcePath);
    	var module = info.file.replace(/([\w]+)\.js$|.css$/, "$1");
    	var ext = isJS ? "js" : "css"
    	if(info.isFile){
    		info = utils.url.info(
    				files.dirMatch(module) + "." + ext,
    				CONFIG.contextPath,CONFIG.resourcePath);
    	}
    	info.isJS = isJS; info.isCSS = isCSS; info.ext = ext;
    	info.module = module;
    	if(info.isJS){
    		files.MODULES[info.module] = info;
    		files.MODULES[path] = info;
    	}
    	return info;
    };
    files.setResourcePath = function(path){
    	this.rpath = path;
    };
    files.getVersion = function(){
    	return CONFIG.version || (new Date()).getTime();
    };
    files.loadJSFile = function(js){
    	$('head').append('<script loaded=true src="' + js + '?_=' + files.getVersion()  +'" type="text/javascript"></script>');
    };
    files.loadCSSFile = function(css){
    	$('head').append('<link loaded=true href="' + css + '?_=' + files.getVersion()  +'" type="text/css" rel=stylesheet></link>');
    };
    files.addStyle = function(css){
    	$('head').append('<style type="text/css" rel=stylesheet>'+css+'</style>');
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
    		if(!files.LOADED[args[j]]){
    			if(args[j].endsWith('.css'))
    				csslist.push(args[j]);
    			else jslist.push(args[j]);
    		}
    	}
    	files.loadJs(jslist,cb);
    	files.loadCss(csslist,cb);
    };
    
    files._jsload_ = function(resource){
    	return $.ajax({
			async: resource.async || false,
			url: resource.url,
			dataType: resource.dataType || "script",
			cache : resource.cache || true,
			data : {
				_ : files.getVersion()
			}
		});
    };
    files._cssload_ = function(resource){
    	return $.get(resource.url);
    };
    files.encrypt_list = function(module_files){
    	return md5(module_files);
    	return "merged"+module_files[0].replace("\/","_",'g'); //utils.string.encode64(params);
    };
    files.prepare_js_request = function(module_files){
		var params = module_files.join(',');
		var encoded = files.encrypt_list(module_files);
		var url = (
				(CONFIG.mergeJS && (typeof CONFIG.mergeJS === 'function' ? CONFIG.mergeJS(params,encoded) : CONFIG.mergeJS))|| 
				(CONFIG.RESOURCE_PATH + 'combine.js')
			)+'?@='+params;
		return {
			module_files : module_files,
			url: url,
			params : params,
			encoded : encoded
		};
    };
    
    files.loadJs = function(list,cb){
    	if(!files.script_rendered){
    		utils.scan_scripts();
    	}
    	if(CONFIG.combineJS && list.length){
        	list = list.filter(function(module_file){
        		return !files.LOADED[module_file];
        	});
        	if(list.length==0) return;
    		files._jsload_(files.prepare_js_request(list)).always(function(resp){
				for(var i in list){
					files.LOADED[list[i]] = list[i];
				}
				if(cb) cb();
			});
    	} else {
    		for(var i in list){
    			if(!files.LOADING[list[i]]){
        			files.LOADING[list[i]] = list[i];
        			files.loadJSFile(list[i]);    			
        			files.LOADED[list[i]] = list[i];
    			}
    		}
    		if(cb) cb();
    	} 
    };
    files.loadCss = function(list,cb){
    	if(CONFIG.combineCSS && list.length){
    		$.ajax({
    			async: true,
    			url: CONFIG.RESOURCE_PATH + 'combine.css?@='+list.join(','),
    			complete : function(){
    				for(var i in list){
    					files.LOADED[list[i]] = list[i];
    				}
    				if(cb) cb();
    			}
    		});
    	} else {
    		for(var i in list){
    			if(!files.LOADING[list[i]]){
        			files.LOADING[list[i]] = list[i];
        			files.loadCSSFile(list[i]);
//        			files._cssload_({ url : list[i]}).done(function(resp){
//        				files.addStyle(resp);
//        			});
        			//files.loadCSSFile(list[i]);    			
        			files.LOADED[list[i]] = list[i];
    			}
    		}
    	} 
    };
    files.get = function(){
    	return $.get.apply(this,arguments);
    };
	utils.ready(function(){
		files.script_rendered = true
	});
});

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
		return window.history.pushState(pageData || null, pageTitle || null, pageUrl);
	};
	url.info = function(_path,_context,_pwd){
		var path = url.resolve(_path,_context,_pwd);
		var info = { url : path };
    	var x = path.split('/');
    	info.isFile = (_path.split('/').length===1);
    	info.file = x.pop();
    	info.dir = x.join('/');
    	return info;
	};
	url.isRemote = function(path){
		return path.indexOf('http://')==0 || path.indexOf('https://')==0;
	};
	url.resolve = function(path,context,pwd){
		var context = context || ""; var pwd = pwd || "";
		if(url.isRemote(path))
			return  path;
		else if(path.indexOf('/')==0){
    		return url.clean(path);
    	} else {
    		return url.clean("/"+context + "/" + pwd + "/" + path);
    	}
	};
	url.clean = function(url){
		url = url.replace(/[\/]+/g,'/');
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
		return (domain +  '/'  + parents.join( '/')).replace(/(\/)+/g,'/');
	};
});

(function(foo){
	foo._require_ = function(){
		return utils.require.apply(utils,arguments);
	};
	var _module_ = foo._module_;
	foo._module_ = function(){
		return utils.module.apply(utils,arguments) || _module_.apply(foo,arguments);
	};
	foo._define_ = function(moduleName, fromModuleName,definition){
		if(arguments.length ===3){
			return utils.define(moduleName).extend(fromModuleName).as(definition);
		} else if(arguments.length === 2){
			return utils.define(moduleName).as(fromModuleName);
		} else {
			return utils.define(moduleName,fromModuleName);
		}
	};
})(this)

