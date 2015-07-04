(function(foo){
	var LIB = {};
	
	var module = function(moduleName){
		return LIB[moduleName].__modulePrototype__;
	};
	
	var ready = function(callback){
		
	};
	
	var Moduler = function Moduler(__modulePrototype__){
		this.intialize.apply(this,arguments);
	};
	
	Moduler.prototype = {
		intialize : function(__modulePrototype__){
			this.__modulePrototype__ = __modulePrototype__ || {};
		},
		module : function(){
			return this.__modulePrototype__;
		},
		extend : function(parentModule){
			this.__extendedFrom___ = parentModule;
			this.__modulePrototype__ = Object.create(module(parentModule));
			LIB[parentModule].callOwnFunction("_extended_",this);
			return this;
		},
		mixin : function(ChildProto){
		    for (var i in ChildProto) {
		        if (ChildProto.hasOwnProperty(i) === true) {
		        	this.__modulePrototype__[i] = ChildProto[i];
		        }
		     }
		    return this;
		},
		as : function(definition){
			if(typeof definition === 'function'){
				var ChildProto = definition.call(this, this.__modulePrototype__, this.__modulePrototype__);
				if(ChildProto !== undefined){
					this.mixin(ChildProto);
				}
			} else if(typeof definition === "object"){
				this.mixin(definition);
			}
			this.callOwnFunction("_define_");
			return this;
		},
		callOwnFucntion : function(prop){
	        if (this.__modulePrototype__.hasOwnProperty(prop) === true && typeof this.__modulePrototype__[prop] === "function") {
	        	return this.__modulePrototype__[prop].apply(this,arguments);
	        }
		}
	};
	
	var AbstractModule = function AbstractModule(){
		
	};
	AbstractModule.prototype = {
		instance :  function(){
			var newObj = Object.create(this);
			newObj._instance_.apply(newObj,arguments);
			return newObj;
		},
		_instance_ : function(){
			
		}
	};
	
	var define = function(moduleInfo,definition){
		var moduleName;
		if(typeof moduleInfo ==="object"){
			moduleName = moduleInfo.name;
		} else if(typeof moduleInfo==="string"){
			moduleName = moduleInfo;
		}
		LIB[moduleName] = new Moduler(new AbstractModule());
		
		if(definition !== undefined){
			LIB[moduleName].as(LIB[moduleName]);
		}
		
		ready(function(){
			LIB[moduleName].callOwnFunction("_ready_");
		});
	};
	
	foo._define_ = define;
	foo._module_ = module;
	
})(this);


