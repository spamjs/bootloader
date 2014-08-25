utils.define('utils.executable', function(executable) {

	executable.id = 0;
	
	executable.once = function(cb,delta,obj){
		this._ = this._ || {};
		this._.rtime = new Date();
	    if (!this._.timeout) {
	    	this._.timeout = true;
	        setTimeout(executable.now.bind(this), delta || 200);
	        this._.cb = cb;
	        this._.args =  this.arguments;
	    }
	};
	
	executable.now = function(){
	    if (new Date() - this._.rtime < this._.delta) {
	        setTimeout(executable.now.bind(this), this._.delta);
	    } else {
	    	this._.timeout = false;
	    	this._.args = this._.args || []; 
	        if(this._.cb)
	        	this._.cb.call(this,this._,this._.args[2],this._.args[3],this._.args[4],this._.args[5]);
	    } 
	}
	executable._instance_ = function Executable(cb,THIS,delta){
		this.id = executable.id++;
		this.delta = delta || 200;this.rtime = new Date();
		this.cb = cb;
		this.callOnce = function(a1,a2,a3,a4,a5,a6){
			if (!this.timeout) {
				this.timeout = true;
		    	setTimeout(this.callNow.bind(this,a1,a2,a3,a4,a5,a6),this.delta);
			}
		};
		this.callNow = function(a1,a2,a3,a4,a5,a6){
			if (new Date() - this.rtime < this.delta) {
		        setTimeout(this.callNow.bind(this,a1,a2,a3,a4,a5,a6), this.delta);
		    } else {
		    	this.timeout = false;
		        if(this.cb)
		        	this.cb.call(THIS || this,a1,a2,a3,a4,a5,a6);
		        if(this.onOver) this.onOver.call(THIS || this,a1,a2,a3,a4,a5,a6);
		    }
		}
		this.prop = function(name,value){
			this[name] = value; return this;
		}
	};
	
	var Queue = function Queue(cb,lotSize,delay){
		this.front = 0;
		this.rear = 0;
		this.map = {}
		this.cb = cb;
		this.empty = true;
		if(this.cb){
			this.free = true;
			this.lotSize = lotSize || 1;
			this.delay = delay || 0;
		}
		this.size = function(){
			return this.front - this.rear;
		}
		this.put = function(obj){
			//nq.push(obj);
			this.map[this.front++] = obj;
			this.empty = false;
			if(this.free) this.executeStart();
		};
		this.get = function(){
			var retObj = this.map[this.rear];
			delete this.map[this.rear];
			(this.front>this.rear)? (this.rear++) : (this.empty=true);
			return retObj;
		};
		this.executeStart = function(){
			this.free = false;
			this.to = setTimeout(this.execute,this.delay)
		};
		this.execute = function(){
			for(var i=0;i<this.lotSize;i++){
				var rep = this.get();
				if(rep){
					this.cb(rep);
				} else 	break;
			}
			if(this.size()>0) this.executeStart();
			else this.free = true; 
		};
	};
	
	executable.queue = function(cb,lotSize,delay){
		return new Queue(cb,lotSize,delay);
	}
	
});

