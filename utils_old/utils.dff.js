select_namespace("utils", function(utils) {
	//THIS FILE IS EXTENSION OF UTILS.JS ACCORDING TO application requirements
	utils.setPathObject = function(_win,_namespace, _cb,alias,argParam){
		if(!argParam) var argParam = {};
		var __win = utils.selectObject(_win,_namespace,_cb, {
			name : _namespace,
			alias : alias,
			argParam : argParam,
			get : function(key){
				return this.argParam[key];
			},
			setError : function(srcObj,argObj1,argObj2,argObj3,argObj4){
				for(var key in srcObj){
					this.key = key;
					this._setError(key, srcObj[key],argObj1,argObj2,argObj3,argObj4);
				}
			},
			_setError : function(key,srcObjValue,argObj1,argObj2,argObj3,argObj4){
				this.argParam[this.name] = key;
				if(this[key] && this[key].set)
					this[key].setError(srcObjValue,argObj1,argObj2,argObj3,argObj4);
				if(this.alias && this[this.alias]){
					this[this.alias]._setError(key,srcObjValue,argObj1,argObj2,argObj3,argObj4)
				}
			},
			set : function(srcObj,argObj1,argObj2,argObj3,argObj4){
				for(var key in srcObj){
					this.key = key;
					this._set(key, srcObj[key],argObj1,argObj2,argObj3,argObj4);
				}
			},
			_set : function(key,srcObjValue,argObj1,argObj2,argObj3,argObj4){
				this.argParam[this.name] = key;
				if(this[key] && this[key].set)
					this[key].set(srcObjValue,argObj1,argObj2,argObj3,argObj4);
				if(this.alias && this[this.alias]){
					this[this.alias]._set(key,srcObjValue,argObj1,argObj2,argObj3,argObj4)
				}
			},
			setPathObject : function(__namespace, __cb,_alias){
				return utils.setPathObject(this,__namespace, __cb,_alias,this.argParam);
			},
			setPathArray : function(__namespace, __cb,_alias){
				return utils.setPathArray(this,__namespace, __cb,_alias,this.argParam);
			}
		});
		return __win;
	};
	utils.setPathArray = function(_win,_namespace, _cb,alias,argParam){
		if(!argParam) var argParam = {};
		var __win = utils.selectObject(_win,_namespace,_cb, {
			name : _namespace,
			alias : alias,
			argParam : argParam,
			get : function(key){
				return this.argParam[key];
			},
			setError : function(srcArray,argObj1,argObj2,argObj3,argObj4){
				for(var i in srcArray){
					this.i = i;
					this._setError(i, srcArray[i],argObj1,argObj2,argObj3,argObj4);
				}
			},
			_setError : function(i,srcObj,argObj1,argObj2,argObj3,argObj4){
				this.argParam[this.name] = i;
				for(var key in srcObj){
					if(this[key] && this[key].set)
						this[key].setError(srcObj[key],argObj1,argObj2,argObj3,argObj4);
					if(this.alias && this[this.alias]){
						this[this.alias]._setError(key,srcObj[key],argObj1,argObj2,argObj3,argObj4)
					}
				}
			},
			set : function(srcArray,argObj1,argObj2,argObj3,argObj4){
				for(var i in srcArray){
					this.i = i;
					this._set(i, srcArray[i],argObj1,argObj2,argObj3,argObj4);
				}
			},
			_set : function(i,srcObj,argObj1,argObj2,argObj3,argObj4){
				this.argParam[this.name] = i;
				for(var key in srcObj){
					if(this[key] && this[key].set)
						this[key].set(srcObj[key],argObj1,argObj2,argObj3,argObj4);
					if(this.alias && this[this.alias]){
						this[this.alias]._set(key,srcObj[key],argObj1,argObj2,argObj3,argObj4)
					}
				}
			},
			setPathObject : function(__namespace, __cb,_alias){
				return utils.setPathObject(this,__namespace, __cb,_alias,this.argParam);
			},
			setPathArray : function(__namespace, __cb,_alias){
				return utils.setPathArray(this,__namespace, __cb,_alias,this.argParam);
			}
		});
		return __win;
	};
	
	utils.custom.grid.format.set('yield_curve',function(){
		var dispFormat = new formatType("percent");
		dispFormat.decimalCount = 4;
	    return dispFormat;
	});
	utils.custom.grid.format.set('curve_shift',function(){
			var dispFormat = new formatType("percent");
			dispFormat.decimalCount = 4;
		    return dispFormat;
	});
	utils.custom.grid.format.set('shifted_curve',function(){
		var dispFormat = new formatType("percent");
		dispFormat.decimalCount = 4;
		return dispFormat;
	});
	
	utils.custom.grid.format.set('zero_rate',function(){
		var dispFormat = new formatType("percent");
		dispFormat.decimalCount = 4;
	    return dispFormat;
	});
	
	utils.custom.grid.format.set('discount_factor',function(){
		var dispFormat = new formatType("currency");
		dispFormat.decimalCount = 4;
		dispFormat.symbol = "";
	    return dispFormat;
	});
	
	utils.custom.grid.format.set('fwd_points',function(){
		var dispFormat = new formatType("currency");
		dispFormat.decimalCount = 2;
		dispFormat.symbol = "";
	    return dispFormat;
	});

});
