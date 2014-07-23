/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

utils.selectNamespace('utils',function(utils){
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
})
