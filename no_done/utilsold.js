/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
window.utils = function(utils) {
    utils.stringify = function(obj) {
        //if(!errorList) var errorList = [];
        try {
            return JSON.stringify(obj);
        } catch (err) {
            //errorList.push(err)
            return utils.stringify({
                msg: "cannot convert JSON to string",
                error: [err]
            });
        }
    };
    utils.parse = function(str, throwExcep) {
        if (typeof (str) == 'object')
            return str;
        try {
            return JSON.parse(str);
        } catch (err) {
            try {
                return $.parseJSON(str);
            } catch (err2) {
                var errorMSG = {msg: "cannot convert to JSON object", error: [err, err2], str: str};
                if (throwExcep)
                    throw err2;
                else
                   console.log(errorMSG);
                return errorMSG;
            }
        }
    };
    utils.selectObject = function(win, namespace, cb, map) {
        if (!win)
            var win = window;
        var nspace = namespace.split('.');
        var retspace = nspace[0];
        for (var i = 0; i < nspace.length; i++) {
            if (!win[nspace[i]])
                win[nspace[i]] = {};
            win[nspace[i]].name = nspace[i];
            retspace = nspace[i];
            win = win[retspace];
        }
        win.namespace = namespace;
        win.namespace_ = win.namespace_ + ".";
        if (map) {
            for (var key in map) {
                win[key] = map[key];
            }
        }
        win.extend = function(_cb){
        	win.__cb__ = _cb;
        	if (win.__cb__)
        		win.__cb__(win, retspace);
        };
      	if (cb) win.extend(cb);
      	
        return win;
    };
    utils.define = utils.selectNamespace = function(namespace, cb, map) {
        return this.selectObject(window, namespace, cb, map);
    };
    utils.queue = function(cb, lotSize, delay) {
        //var dq = [];
        //var nq = [];
        var queue = {front: 0, rear: 0, map: {}, cb: cb};
        queue.empty = true;
        if (queue.cb) {
            queue.free = true;
            queue.lotSize = lotSize || 1;
            queue.delay = delay || 0;
        }
        queue.size = function() {
            return this.front - this.rear;
        }
        queue.put = function(obj) {
            //nq.push(obj);
            this.map[this.front++] = obj;
            queue.empty = false;
            if (this.free)
                this.executeStart();
        };
        queue.get = function() {
            var retObj = this.map[this.rear];
            delete this.map[this.rear];
            (this.front > this.rear) ? (this.rear++) : (this.empty = true);
            return retObj;
        };
        queue.executeStart = function() {
            this.free = false;
            this.to = setTimeout(this.execute, this.delay)
        };
        queue.execute = function() {
            for (var i = 0; i < queue.lotSize; i++) {
                var rep = queue.get();
                if (rep) {
                    queue.cb(rep);
                } else
                    break;
            }
            if (queue.size() > 0)
                queue.executeStart();
            else
                queue.free = true;
        };
        return queue;
    };
	utils.screen = {
		rtime : new Date(1, 1, 2000, 12,00,00),
		timeout : false,
		delta : 200
	}
	utils.execute = {
		id : 0,
		once : function(cb,delta,obj){
			this._ = this._ || {};
			this._.rtime = new Date();
		    if (!this._.timeout) {
		    	this._.timeout = true;
		        setTimeout(utils.execute.now.bind(this), delta || 200);
		        this._.cb = cb;
		        this._.args =  this.arguments;
		    }
		}, now : function(){
		    if (new Date() - this._.rtime < this._.delta) {
		        setTimeout(utils.execute.now.bind(this), this._.delta);
		    } else {
		    	this._.timeout = false;
		    	this._.args = this._.args || []; 
		        if(this._.cb)
		        	this._.cb.call(this,this._,this._.args[2],this._.args[3],this._.args[4],this._.args[5]);
		    } 
		},
		executable : function executable(cb,THIS,delta){
			this.id = utils.execute.id++;
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
		},
		define : function(cb,THIS,delta){
			return new this.executable(cb,THIS,delta);
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
    window.onresize = function(e) {
        return utils.execute.once(function() {
            if (window.onresizeend)
                window.onresizeend(this.__);
            if (utils.onResize)
                utils.onResize(this.__);
        }, utils.execute.delta);
    };
    window.onscroll = function(e) {
        return utils.execute.once(function() {
            if (window.onscrollend)
                window.onscrollend(this.__);
            if (utils.onScroll)
                utils.onScroll(this.__);
        }, utils.execute.delta);
    };
    return utils;
}({});
