utils.define('utils.logger',function(logger){
    	///CONSOLE LOGGER
	logger.Timer = function(){
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
	
	logger.traceEvent = function Trace(timer) {
		this.timer = timer;
		this.length = 0;
		this.push = Array.prototype.push;
		this.pop = Array.prototype.pop;
		this.splice = Array.prototype.splice;
		this.push(timer);
		this.error = function(err){
			this.lineNumber = err.lineNumber;
			this.fileName = err.fileName;
			this.push(err.fileName);
			this.push(err.lineNumber);
		};
		this.caller = function(caller){
			this.callerName = caller.name;
			this.push(caller.name);
			this.callerFunction = caller.toString();
		}
		this.stackTrace = printStackTrace();
		this.stackTrace.splice(0,6)
	}
	
	var debugTimerMap = {};
	logger.debugTimer = function(timer,clearNew){
		var _timer = debugTimerMap[timer];
		if(!_timer || clearNew){
			_timer = debugTimerMap[timer] = new logger.Timer();
		}
		var deBugMesgEvent = new logger.traceEvent(timer);
		deBugMesgEvent.push(_timer());
		deBugMesgEvent.push("+"+_timer.getIncTime())
		return deBugMesgEvent;
	};
	
	/**
	 *  Functiont o return time taken so far
	 * 
	 *  @param timer - name of bookmark timer
	 *  @param message 
	 *  	- if true, then restarts the timer, else time-gap between this and last bookmark,
	 *  	if passed new Error(), then will print the line no and file name.
	 *  
	 *  @param args - message to be printed
	 */
	logger.timer = function(timer,message,arg1,arg2,arg3){
		var isNew = (message===true);
		var deBugMesgEvent = logger.debugTimer(timer,isNew);
		deBugMesgEvent.caller(arguments.callee.caller);
		if(isNew)
			return logger.info(deBugMesgEvent,arg1,arg2,arg3);
		if(message && message.name =='Error'){
			deBugMesgEvent.error(message);
			return logger.info(deBugMesgEvent,arg1,arg2,arg3);
		} else 
			return logger.info(deBugMesgEvent,message,arg1,arg2,arg3);
	};
	
    /**
     *  log for info purpose
     */
	logger.info = function () {
        if (this.debug && console && console.info) {
            console.info.apply(this,arguments)
        }
    };
	
    /**
     *  log for debugging
     */
	logger.debug = function () {
        if (this.debug && console && console.debug) {
            console.debug.apply(this,arguments)
        }
    };
	
    /**
     *  log for logging
     */
	logger.log = function () {
        if (this.debug && console && console.log) {
            console.log.apply(this,arguments)
        }
    };
    
    /**
     *  warnings, traces by default
     *  can be suppressed by `silent` option.
     */
    logger.warn = function () {
        if (!this.silent && console) {
            console.warn.apply(this,arguments)
            if (this.debug && console.trace) {
                console.trace()
            }
        }
    };
    
    logger._config_ =  function(config){
    	this.debug = utils.confg.get('debug');
    	this.silent = utils.confg.get('silent');
    }
    
});