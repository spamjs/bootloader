window.utils = function(utils){
	if(!utils){
		if(console.error) console.error( "utils dependency 'underscore' not included");
	}
	if(!jQuery) throw "utils dependency 'jQuery' not included";
	
	window.isSet = function(val){
		return (val!==undefined)
	}
	window.isEmpty = function(val){
		return (val==undefined) || (val==='')
	}
	window.isEmptyString = function(val){
		if(typeof(val)=='string')
			return  (val==='') || (val.trim()==='')
		else false;
	};
	utils = {};
	utils.toLowerCase = window.toLowerCase = function(val){
		return (val==undefined) || (val==='') ? val : (""+ val).toLowerCase();
	}
	utils.toUpperCase =window.toUpperCase = function(val){
		return (val==undefined) || (val==='') ? val : (""+val).toUpperCase();
	}
	utils.isEmpty = window.isEmpty;
	utils.isSet = window.isSet;
	utils.agent = {
			dateformat : 0, // ACCEPT 0 (US) or 1(NON-US) 
			none : ""
	}
	utils.toBoolean = function(str){
		if(str)str = str.toString()
		if(!str || str.toLowerCase()=='false') return false;
		return true;
	}
	utils.trim = function(str){
		if(str=== undefined ||str == null)str =  "";
		else str =str.trim();
		return str;
	}
	utils.setAgent = function(key, value,arg2,arg3){
		if(this.setAgent[key]) utils.agent[key] = this.setAgent[key](value,arg2,arg3);
		else this.agent[key] = value;
	};
	utils.isValid = function(value){
		if(value==undefined) return false;
		else if(isNaN(value) && typeof(value)=='number') return false;
		return true;
	};
	utils.isFinite = function(num){
		if(window.isFinite) return window.isFinite(num)
		else if(Number.isFinite) return Number.isFinite(num);
		return false;
	};
	utils.getObject = function(obj,ref){
		if(obj==undefined){
			var obj = {}; 
			if(ref && jQuery.isArray(ref)) obj = [];
		}
		for(var key in ref){
			if(obj[key]==undefined) obj[key] = ref[key];
		} return obj;
	};
	utils.format = function(){
		var format = { mapHandler : {} };
		format.getValue = function(formatType,value,options){
			if(formatType && this[formatType])
				return this[formatType](value,options);
			else return value;
		};
		format.getObject = function(formatType, options){
			if(formatType && this.mapHandler[formatType])
				return this.mapHandler[formatType](options);
			else{
				options.dVal = options.iVal
				return options;
			}
		};
		format._get = function(value,options){
			if(typeof(value)=='object'){
				if(!value) return value;
				var formatType = value.formatType;
				return this.getObject(formatType,value)
			} else {
				if(!options) return value;
				var formatType = options.formatType;
				return this.getValue(formatType,value,options);
			}
		};
		format.get = function(formatType,value,options){
			if(typeof(value)=='object'){
				return this.getObject(formatType,value);
			} else return this.getValue(formatType,value,options);
		};
		format.set = function(formatType,handler,mapHandler){
			this[formatType] = handler;
			this.mapHandler[formatType] = mapHandler;
		};
		format.hasMap = function(formatType){
			if(this.mapHandler[formatType]) return true;
			return false;
		}
		return format;
	}();
	utils.ifPresent = function(obj,keyString){
		var nspace = keyString.split('.');
		var win = obj
		for(var i =0; i<nspace.length; i++){
			win = win[nspace[i]];
	        if (!win) return win;
	    } return win;
	}
	utils.sessionStorage = function(ss){
		ss.cache = {};
		ss.set = function(key,value){
			return this.cache[key]=value;
		};
		ss.get = function(key){
			return this.cache[key];
		};
		ss.isSet = function(key){
			return !(this.cache[key]==undefined || this.cache[+key]==null);
		};
		return ss;
	}({});
	utils.selectObject = function(win,namespace, cb, map){
		if(!win) var win = window;
		var nspace = namespace.split('.');
		var retspace = nspace[0];
		for(var i =0; i<nspace.length; i++){
	        if (!win[nspace[i]]) win[nspace[i]] = {};
	        win[nspace[i]].name = nspace[i];
	        retspace = nspace[i];
	        win = win[retspace];
	    }
		win.namespace = namespace;
		win.retspace = retspace;
		win.setObject = function(_namespace,_cb){
			return utils.selectObject(win,_namespace,_cb);
		};
		win.GET = function(fname){
			var x = arguments;
			if(this["get_"+fname]) return this["get_"+fname]; //(x[1],x[2],x[3],x[4],x[5],x[6],x[7],x[8],x[9],x[10])
			else throw "function '" + fname + "' is not defined for "+ this.name;
		};
		
		win.namespace_ = win.namespace_+".";
		
		win.cache = {};
		win.itemSet = function(key,value){
			return this.cache[key]=value;
		};
		win.itemGet = function(key){
			return this.cache[key];
		};
		win.isSet = function(key){
			return !(this.cache[key]==undefined || this.cache[key]==null);
		};
		
		win.sessionSet = function(key,value){
			return utils.sessionStorage.set(this.namespace_+key,value)
		};
		win.sessionGet = function(key){
			return utils.sessionStorage.get(this.namespace_+key)
		};
		win.isSessionSet = function(key){
			return utils.sessionStorage.isSet(this.namespace_+key);
		};
		if(map) {
			for(var key in map){
				win[key] = map[key];
			}
		}
		win.extend = function(_cb){
			_cb(this);
		};
	    if (cb) cb(win,retspace);
	    return win;
	};
	utils.unify = function(iList){
		var tempObj = {};
		var retList = [];
		for(var i in iList){
			if(tempObj[iList[i]]==undefined){
				retList[retList.length] = iList[i];
			}
			tempObj[iList[i]] = true;
		}
		return retList;
	};
	utils.indexOf = function(iList, search){
		for(var i in iList){
			if(iList[i]==search)
				return i;
		}
		return -1;
	};
	utils.removeUndefined = function(ilist){
		iList = [];
		for(var i in ilist){
			if(ilist[i]===undefined){
			} else if(ilist[i]===""){
			} else iList.push(ilist[i]);
		}
		return iList;
	};
	utils.listSort = function(tempList){
		var tempVal = 0;
		for(var i = 0; i < tempList.length -1; i++){
			for(var j = 0; j < tempList.length - 1; j++){
				if(tempList[j] > tempList[j-1+2]){
					tempVal = tempList[j];
					tempList[j] = tempList[j-1+2];
					tempList[j-1+2] = tempVal;
				}
			}	
		}	
		return tempList;
	};
	utils.moveInList = function(iList, sPos, tPos){
		var elem = iList[sPos];
		if(sPos<tPos){
			for(var i=sPos; i<=tPos; i++){
				iList[i] = iList[i-0+1]
			}
		} else {
			for(var i=sPos; i>tPos; i--){
				iList[i] = iList[i-1];
			}
		}
		iList[tPos] = elem;
		return iList;
	};
	utils.each = function(list,cb,andThen){
		if(!andThen) return utils.eachNow(list,cb);
		else utils.eachLazy(list,cb,andThen);
	};
	utils.eachLazy = function(list,cb,andThen,steps){
		var th = { steps : steps || 1,list: [], counter : -1, 
				andThen : andThen , data : list,cb : cb, _cb : function(){
					if(this.counter<this.list.length){
						for(var i=this.counter; i<this.list.length;i++){
							this.key = this.list[++this.counter];
							this.value = this.data[this.key];
							if(this.key) {
								this.cb(this.key,this.value)
							}
						}
						var  THIS = this;
						setTimeout(function(){THIS._cb();},0);
					} else this.andThen();
			}
		};
		for(var i in list){
			th.list.push(i);
		}
		setTimeout(function(){th._cb();},0);
	};
	utils.eachNow = function(list,cb){
		for(var i in list){
			cb(i,list[i]);
		}
	};
	utils.getSize = function(list){
		if(Object.keys) return Object.keys(list).length;
		else {
			var size=0
			for(var i in list){
				size++;
			}
			return size;
		}
	};
	utils.duplicate = function(obj){
		var retObj = obj;
		if(!obj){
			LOG.warn("Cannot dubplicate",obj);
			return retObj;
		}
		try {
			var newString = JSON.stringify(obj);
			retObj = JSON.parse(newString);
		} catch(err) {
			LOG.error("NOT SAFE",obj,newString);
			retObj = utils.makeCopy(obj,10);
		}
		return retObj;
	};
	utils.makeCopy = function(obj, level){
		if(level){
			if(jQuery.isPlainObject(obj)){
				var newObj = {};
			} else if(jQuery.isArray(obj)){
				var newObj = [];
			} else return obj;
			for(var key in obj){
				newObj[key] = utils.makeCopy(obj[key],level-1)
			}
			return newObj;
		} else {
			return obj;
		}
	};
	utils.stringify = function(obj){
		//if(!errorList) var errorList = [];
		try {
			return JSON.stringify(obj);
		} catch (err){
			//errorList.push(err)
			return utils.stringify({ 
				msg : "cannot convert JSON to string",
				error : [err]
			});
		}
	};
	utils.parse = function(str, throwExcep){
		if(typeof(str)=='object') return str;
		try { return JSON.parse(str);
		} catch (err){
			try{
				return $.parseJSON(str);
			} catch(err2){
				var errorMSG = { msg : "cannot convert to JSON object",	error : [err, err2], str : str };
				if(throwExcep) throw err2;
				else LOG.error(errorMSG);
				return errorMSG;
			}
		}	
	};
	utils.fixQ = function(size){
		this.size = size;
		this.clock = 0;
		this.list = [];
		this.push = function(obj){
			var ret = this.list[this.clock];
			this.list[this.clock] = obj;
			this.clock = (++this.clock)%this.size;
			return ret;
		};
		this.getOldest = function(){
			return this.list[this.clock]
		};
		this.getLatest = function(){
			return this.list[(this.clock-1+this.size)%this.size];
		};
		this.empty = function(){
			this.clock = 0;
			this.list = [];
		};
	}
	utils.queue = function(cb,lotSize,delay){
		//var dq = [];
		//var nq = [];
		var queue = { front : 0, rear : 0, map : {},cb:cb};
		queue.empty = true;
		if(queue.cb){
			queue.free = true;
			queue.lotSize = lotSize || 1;
			queue.delay = delay || 0;
		}
		queue.size = function(){
			return this.front - this.rear;
		}
		queue.put = function(obj){
			//nq.push(obj);
			this.map[this.front++] = obj;
			queue.empty = false;
			if(this.free) this.executeStart();
		};
		queue.get = function(){
			var retObj = this.map[this.rear];
			delete this.map[this.rear];
			(this.front>this.rear)? (this.rear++) : (this.empty=true);
			return retObj;
		};
		queue.executeStart = function(){
			this.free = false;
			this.to = setTimeout(this.execute,this.delay)
		};
		queue.execute = function(){
			for(var i=0;i<queue.lotSize;i++){
				var rep = queue.get();
				if(rep){
					queue.cb(rep);
				} else 	break;
			}
			if(queue.size()>0) queue.executeStart();
			else queue.free = true; 
		};
//		queue.reset = function(){
//			var retObj = nq.pop();
//			while(retObj!=undefined){
//				dq.push(retObj);
//				retObj = nq.pop();
//			}
//		};
		queue.filter = function(){
			/*  filterQueue For Duplicate hashes
			 *  shud keep the latest value for each hash
			 *  delete others
			 */
		};
		return queue;
	};
	
	utils.isCrossDomain = function(URL){
		var _URLHOME = (URL.split(/\/+/g)[1]) ? URL.split(/\/+/g)[1].split('?')[0] : '';
		var crossDomain = _URLHOME
		if(URL.indexOf("://") === -1) {
			crossDomain = false;
		} else {
			crossDomain = (location.href.split(/\/+/g)[1].split('?')[0] !== _URLHOME);
		}
		if(crossDomain){
			return _URLHOME;
		}; return crossDomain;
	};
	utils.deleteCookie = function(name){
	    document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
	};
	utils.readCookie = function(name) {
	    var nameEQ = name + "=";
	    var ca = document.cookie.split(';');
	    for(var i=0;i < ca.length;i++) {
	        var c = ca[i];
	        while (c.charAt(0)==' ') c = c.substring(1,c.length);
	        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	    }
	    return null;
	};
	utils.setCookie = function(name,value,days) {
	    if (days) {
	        var date = new Date();
	        date.setTime(date.getTime()+(days*24*60*60*1000));
	        var expires = "; expires="+date.toGMTString();
	    }
	    else var expires = "";
	    document.cookie = name+"="+value+expires+"; path=/";
	}
	utils.getRequestObject = function(retObj){
		if(!retObj) var retObj = {};
		if(!retObj.type) retObj.type = "GET";
		
		retObj.dataType = "html";
		retObj.cache = false;
		retObj.async = true;
		retObj.success = function(msg){	  };
		retObj.error = function(msg){ LOG.error("error",msg); };
		retObj.complete = function(msg){   };
		
    	retObj.crossDomain = utils.isCrossDomain(retObj.url);
    	
		retObj.dataType = "html";
		if(retObj.crossDomain){
    	  retObj.dataType = "jsonp";
		}
		return retObj;
	};
	utils.JSONFunMap = {}
	utils.setJSONURLFun = function(key,url,getJSONFun){
		var crossDomain = utils.isCrossDomain(url);
		if(crossDomain){
			for(var _url in utils.JSONFunMap){
				if(utils.JSONFunMap[_url].key==key){
					delete utils.JSONFunMap[_url];
				}
			}
			utils.JSONFunMap[crossDomain] = {
					crossDomain : crossDomain,
					url : url,
					key : key,
					getJSONFun : getJSONFun
			}
		}
	};
	
	utils.getJSON = function(url,handler,query,obj){
		if(handler) handler([{id : "", name : "Searching..."}]);
		if(!obj) var obj = {};
		if(!obj.error400)
			obj.error400 = "No Response";
		obj.url = url;
	      
	    var reqObj = utils.getRequestObject(obj);
	    reqObj.data = query;
	    reqObj.success = function(msg){
    		if(handler) handler([{id : "", name : "", display : "Response Recieved"}]);
    		if(msg){
	    		var resp = utils.parse(msg);
	    		if(handler) handler(resp);
    		} else {
    			if(handler) handler([{id : "", name : "",display : "Some tech error occured"}]);
    			throw "data from server cannot be decrypted";
    		}
	    };
	    reqObj.error = function(msg){
	    	if(handler) handler([{id : "", name : "",display : obj.error400 }]);
	    };
	    var crossDomain = utils.isCrossDomain(obj.url);
	    if(crossDomain && utils.JSONFunMap[crossDomain])
	    	return utils.JSONFunMap[crossDomain].getJSONFun(reqObj);
	    $.ajax(reqObj);
	};
	
	utils.onBodyClickMap = {};
	utils.onBodyClick = function(fName, cbFun){
		if(fName==undefined){
			for(var i in utils.onBodyClickMap){
				utils.onBodyClickMap[i]();
			}
		} else if(cbFun==undefined){
			utils.onBodyClickMap[fName]();
		} else 
			utils.onBodyClickMap[fName] = cbFun;
	};
	utils.navKeys = [37,38,39,40,9,13];
	utils.isArrowKey = function(key){
		return (key<41 && key>36)
	};
	utils.isNavKey = function(key,shiftCheck){
		return ($.inArray(key,utils.navKeys) !== -1) || (shiftCheck!=undefined && key==16);
	};
	utils.isNumKey = function(key,e){
		return  key==17 || key==18 || (47<key && key<58 && (!e || e.shiftKey==false)) 
        || (95<key && key<106) || (key==8) || (key==9) 
        || (key>34 && key<40) || (key==46)
	};
	utils.fireEvent = function(name, data) {
		  var e = document.createEvent("Event");
		  e.initEvent(name, true, true);
		  e.data = data;
		  window.dispatchEvent(e);
	};
	utils.preventPropagation = function (event) {
		if (!event)var event = window.event;
		if (event) {
			if (event.preventDefault) {
				event.preventDefault();
				event.cancelBubble = true;
				event.returnValue = false;
				event.stopPropagation && event.stopPropagation();
				event.stopImmediatePropagation && event.stopImmediatePropagation();
			} else {
				event.cancelBubble = true;
				event.returnValue = false;
				event.stopPropagation && event.stopPropagation();
				event.stopImmediatePropagation && event.stopImmediatePropagation();
				return false;
			}
		}
	};
	///CONSOLE LOGGER
	utils.Timer = function(){
		var startTime = new Date().getTime();
		var lastTime = 0; var incTime =0;
		var now = function(){
    		var s = new Date().getTime();
    		var _lastTime = s - startTime;
    		incTime = _lastTime - lastTime;
    		lastTime = _lastTime;
    		return lastTime;
		}
		now.getIncTime = function(){
			return incTime;
		}
		return now;
	}
	utils.debugTimerMap = {};
	utils.debugTimer = function(timer,clearNew){
		var _timer = utils.debugTimerMap[timer];
		if(!_timer || clearNew){
			_timer = utils.debugTimerMap[timer] = new utils.Timer();
		}
		return timer + ":" + _timer() + "(+"+_timer.getIncTime()+")";
	} 
	
	window._LOG = function(){
		var LOG = { is_trace : false };
		if (!window.console) window.console = {};
		if (!window.console.log) window.console.log = function(){};
		if (!window.console.trace) window.console.trace = function(){};
		LOG.show = function(a,b,c,d,e,f,g,h,i){
			if(window.console.log) window.console.log(a,b,c,d,e,f,g,h,i); 
			this.trace(a,b,c,d,e,f,g,h,i);
		};
	        LOG.json = function(a){
			if(window.console.log) window.console.log(utils.stringify(a)); 
		};
		LOG.trace = function(a,b,c,d,e,f,g,h,i){ 
			if(window.console.trace && LOG.is_trace) return window.console.trace(a,b,c,d,e,f,g,h,i);
			return false;
		};
		if (!window.console.info) window.console.info = function(){};
		LOG.info = function(a,b,c,d,e,f,g,h,i){
			if(window.console.info) window.console.info(a,b,c,d,e,f,g,h,i); 
			return this.trace(this,arguments);
		};
		if (!window.console.warn) window.console.warn = function(){};
		LOG.warn = function(a,b,c,d,e,f,g,h,i){
			if(window.console.warn) window.console.warn(a,b,c,d,e,f,g,h,i); 
			this.trace(this,arguments);
		};
		if (!window.console.debug) window.console.debug = function(){};
		LOG.debug = function(a,b,c,d,e,f,g,h,i){
			if(window.console.debug) window.console.debug(a,b,c,d,e,f,g,h,i); 
			this.trace(this,arguments);
		};
		if (!window.console.error) window.console.error = function(){};
		LOG.error = function(a,b,c,d,e,f,g,h,i){
			if(window.console.error) window.console.error(a,b,c,d,e,f,g,h,i); 
			return this.trace(a,b,c,d,e,f,g,h,i);
		};
		LOG.timer = function(timer,message,arg1,arg2,arg3){
			var isNew = (message===true);
			var arg0 = message;
			if(isNew) return LOG.warn(utils.debugTimer(timer,isNew),arg1,arg2,arg3);
			if(message && message.name =='Error'){
				arg0 = "["+message.lineNumber+":"+message.fileName + "]";
			}
			return LOG.warn(utils.debugTimer(timer,isNew),arg0,arg1,arg2,arg3);
		};
		return LOG;
	}();
	window.__LOG = {
	        "log": function(){}, "warn": function(){},"debug": function(){},"info": function(){},
	        "trace": function(){}, "error": function(){},"show": function(){},"timer" : function(){}
	};
	
	window.LOG = window.__LOG;
	utils.debugEnabled = function(enable,logType){
		utils.debug = enable;
		var logTypes = logType ? [logType] : ['warn','debug','info','trace','error','show','timer'];
		for(var i in logTypes){
			window.LOG[logTypes[i]] = enable ? window._LOG[logTypes[i]] : window.__LOG[logTypes[i]];
		}
	};
	utils.debugToggle = function(logType){
		window._LOG['is_'+logType] = !window._LOG['is_'+logType];
	}
	
	utils.screen = {
		rtime : new Date(1, 1, 2000, 12,00,00),
		timeout : false,
		delta : 200
	}
	utils.execute = {
		once : function(cb,delta,obj){
			this._ = this._ || {};
			this._.rtime = new Date();
		    if (!this._.timeout) {
		    	this._.timeout = true;
		        setTimeout(utils.execute.now.bind(this), delta || 200);
		        this._.cb = cb;
		        this._.obj = obj;
		    }
		}, now : function(){
		    if (new Date() - this._.rtime < this._.delta) {
		        setTimeout(utils.execute.now.bind(this), this._.delta);
		    } else {
		    	this._.timeout = false;
		        if(this._.cb)
		        	this._.cb.call(this,this._,this.obj);
		    } 
		}
	};
	utils.executeOnce = function(cb,delta,obj){
		utils.screen.rtime = new Date();
	    if (utils.screen.timeout === false) {
	    	utils.screen.timeout = true;
	    	var _delta = delta || utils.screen.delta;
	        setTimeout(utils.executeNow, _delta);
	        utils.screen.cb = cb;
	        utils.screen.obj = obj;
	    }
	};
	utils.TRY = function(cb,fun){
		try{ if(cb) return cb(); }
		catch(e){ LOG.error('TRY:'+fun,e)}
	};
	utils.executeNow = function(){
	    if (new Date() - utils.screen.rtime < utils.screen.delta) {
	        setTimeout(utils.executeNow, utils.screen.delta);
	    } else {
	    	utils.screen.timeout = false;
	        if(utils.screen.cb)
	        	utils.screen.cb(utils.screen,utils.screen.obj);
	    } 
	};
	window.onresize = function(e){
		utils.screen.rtime = new Date();
	    if (utils.screen.timeout === false) {
	    	utils.screen.timeout = true;
	        setTimeout(window.resizeend, utils.screen.delta);
	    }
	};
	window.resizeend = function() {
	    if (new Date() - utils.screen.rtime < utils.screen.delta) {
	        setTimeout(window.resizeend, utils.screen.delta);
	    } else {
	    	utils.screen.timeout = false;
	    	utils.screen = utils.getBrowser();
	        if(window.onresizeend) window.onresizeend (utils.screen);
	        if(utils.onResize) utils.onResize(utils.screen);
	    }               
	};
	utils.getBrowser = function(){
		var $b = $.browser;
		$.extend(utils.screen,$.browser);
		utils.screen.isZoomed = false;
		var screen  = utils.screen;
		screen.zoomf  = screen.zoom = 1;
		screen.width = window.screen.width;
		screen.height = window.screen.height;
		if($b.mozilla){ //FOR MOZILLA
			var media  = window.matchMedia('(max--moz-device-pixel-ratio:0.99), (min--moz-device-pixel-ratio:1.01)');
			if(media) screen.isZoomed  = media.matches;
		} else {
			if($b.chrome){ //FOR CHROME
				screen.zoom = (window.outerWidth - 8) / window.innerWidth;
				screen.isZoomed = (screen.zoom < .98 || screen.zoom > 1.02)
			} else if($b.msie){//FOR IE7,IE8,IE9
				var scrn = document.frames.screen;
				screen.zoom = ((scrn.deviceXDPI / scrn.systemXDPI) * 100 + 0.9).toFixed()/100;
				screen.isZoomed = (screen.zoom < .98 || screen.zoom > 1.02);
				if(screen.isZoomed) screen.zoomf = screen.zoom;
				screen.width = window.screen.width*screen.zoomf;
				screen.height = window.screen.height*screen.zoomf;
			}
		}
		return utils.screen;
	}
	utils.encode = function(obj){
		return utils.encode64(utils.stringify(obj))
	}
	utils.decode = function(str, isString){
		var _str = utils.decode64(str);
		if(isString) return _str;
		try{
			return utils.parse(_str,true);
		} catch (e) {
			LOG.error(e)
			return _str;
		}
	}
	utils.keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
	utils.encode64 = function(input) {
	     input = escape(input);
	     var output = "";
	     var chr1, chr2, chr3 = "";
	     var enc1, enc2, enc3, enc4 = "";
	     var i = 0;
	     do {
	        chr1 = input.charCodeAt(i++); chr2 = input.charCodeAt(i++); chr3 = input.charCodeAt(i++);
	        enc1 = chr1 >> 2; enc2 = ((chr1 & 3) << 4) | (chr2 >> 4); enc3 = ((chr2 & 15) << 2) | (chr3 >> 6); enc4 = chr3 & 63;

	        if (isNaN(chr2)) {
	           enc3 = enc4 = 64;
	        } else if (isNaN(chr3)) {
	           enc4 = 64;
	        }
	        output = output +
	        	utils.keyStr.charAt(enc1) +
	           utils.keyStr.charAt(enc2) +
	           utils.keyStr.charAt(enc3) +
	           utils.keyStr.charAt(enc4);
	        chr1 = chr2 = chr3 = "";
	        enc1 = enc2 = enc3 = enc4 = "";
	     } while (i < input.length);
	     return output;
	  }

	utils.decode64 = function(input) {
	     var output = "";
	     var chr1, chr2, chr3 = "";
	     var enc1, enc2, enc3, enc4 = "";
	     var i = 0;

	     // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
	     var base64test = /[^A-Za-z0-9\+\/\=]/g;
	     if (base64test.exec(input)) {
	        throw ("There were invalid base64 characters in the input text.\n" +
	              "Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" +
	              "Expect errors in decoding.");
	     }
	     input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

	     do {
	        enc1 = utils.keyStr.indexOf(input.charAt(i++));
	        enc2 = utils.keyStr.indexOf(input.charAt(i++));
	        enc3 = utils.keyStr.indexOf(input.charAt(i++));
	        enc4 = utils.keyStr.indexOf(input.charAt(i++));

	        chr1 = (enc1 << 2) | (enc2 >> 4);
	        chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
	        chr3 = ((enc3 & 3) << 6) | enc4;

	        output = output + String.fromCharCode(chr1);

	        if (enc3 != 64) {
	           output = output + String.fromCharCode(chr2);
	        }
	        if (enc4 != 64) {
	           output = output + String.fromCharCode(chr3);
	        }

	        chr1 = chr2 = chr3 = "";
	        enc1 = enc2 = enc3 = enc4 = "";

	     } while (i < input.length);

	     return unescape(output);
	  }

	
	utils.get_json_length = function(json) {
		var count = 0;
		for(var i in json) {
			count++;
		}
		return count;
	}
	
	utils.modifyClass = function(selector, className, enableFlag) {
		var $obj = $(selector);
		if(enableFlag) {
			$obj.removeClass(className);
		} else {
			$obj.addClass(className);
		}
	};
	
	utils.modifyAttr = function(selector, attrValue, flag) {
		var $obj = $(selector);
		if(flag) {
			$obj.attr(attrValue, attrValue);
		} else {
			$obj.removeAttr(attrValue);
		}
	}
	
	utils.modifyValue = function(selector, value,def_value, enableFlag) {
		var $obj = $(selector);
		if(enableFlag) {
			$obj.setValue(value);
		} else {
			$obj.setValue(def_value);
		}
	};
	
	utils.modifyText = function(selector, value,def_value, enableFlag) {
		var $obj = $(selector);
		if(enableFlag) {
			$obj.text(value);
		} else {
			$obj.text(def_value);
		}
	};

	utils.escapeCopy = function(STRING){
		return escape(STRING.replace(
				new RegExp(String.fromCharCode(8217),'g'),'\''
		));
	};
	utils.unescapeCopy = function(STRING){
		return unescape(STRING);
	};

	utils.custom = {
		defaultReady : {
			init : function(){
				utils.sessionStorage = $.sessionStorage || utils.sessionStorage
			}
		}
	};
	return utils;
}(window._);
//alert('dsdsds');
//console.log('_',_,utils);
function select_namespace(namespace,cb){
	return utils.selectObject(window,namespace, cb)
};
function select_key(app, string, defVal){
    var nspace = string.split('.');
    if(!app) app = {};
    var inKey = app;
    var prevKey = app;
    var lastKey = nspace[1];
    var new_init = false;
    for(var i = 1; i< nspace.length; i++){
        if(!inKey[nspace[i]]) {inKey[nspace[i]] = {}; new_init = true;}
        else new_init = false;
        prevKey = inKey;
        lastKey = nspace[i];
        inKey = inKey[nspace[i]];
    }
    if(defVal && new_init) {
        prevKey[lastKey] = defVal;
    }
    return prevKey[lastKey];
};
function VarRef(path){
	var nspace = path.split('.');
	var lastKey = nspace[nspace.length-1];
	this.getRefObj = function(OBJ){
		var win = OBJ || {};
		var retspace = nspace[0];
		for(var i =0; i<nspace.length-1; i++){
			retspace = nspace[i];
			win[retspace] = win[retspace] || [];
			win = win[retspace];
	    } return win;
	};
	this.set = function(OBJ,value){
		var win = this.getRefObj(OBJ)
		win[lastKey] = value;
		return OBJ;
	};
	this.get = function(OBJ,defValue){
		var win = this.getRefObj(OBJ)
		return win[lastKey] || defValue;
	};
}

function xoxo(msg){}
function preventPropagation(event) {
	return utils.preventPropagation(event);
};

utils.selectNamespace("utils.messages", function(messages){
    messages.keys = {
    	defaultmessage : ["..............."]
    }
    messages.get = function(key){
        	if(key){
            	var keyList  = key.split(":");
            	var retMsg = messages.keys[keyList[0]];
            	if(retMsg){
            		if(keyList.length>1){
            			for(var i=1; i<keyList.length; i++)
            				retMsg = retMsg.replace("$"+i,keyList[i]);
            		} return retMsg;
            	} else LOG.info('noMessage: ', key);
        	}; return key;
    };
    messages.label = { risk : {}, greek : {} };
    window.i18n = window.$txt = window.$trans = window.$text = messages.get;
    window.$label = messages.label;
});


function DOMCache($context){
	this._CACHE = {};
	this.$context = $context;
	this.$ = function(selector,_$context){
		if(!this._CACHE[selector] || !!_$context) {
			this._CACHE[selector] = $(selector,_$context || this.$context);
		} return this._CACHE[selector];
	}
}
