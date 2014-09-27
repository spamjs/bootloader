/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

utils.define('utils.tunnel', function(tunnel) {

    tunnel.token = '-1';
    tunnel.counterEnd = 0;
    tunnel.counterStart = 0;
    tunnel.eventCounter = 0;
    tunnel.started = false;
    var eventMap = {};
    tunnel.open = function(){
    	if(tunnel.started) return false;
    	else tunnel.longPoll('utils.tunnel._onOpen_','handshake');
    };
    tunnel._onMessage_ = function(resp) {
    	try{
    		this.counterStart = this.counterEnd;
    		this.counter = resp.counter;
    		for(var i in resp.data){
    			this.counterEnd = Math.max(this.counterEnd,resp.data[i].id);
    			resp.data[i].data = utils.parse(resp.data[i].eData);
    			console.log('tunnel.onMessage',this.counterEnd,resp.data[i].data);
    		}
    		this.time = resp.time;
    	} catch(e){
    		console.error('error while processing lpoll response',e);
    	} finally {
    		tunnel.longPoll('utils.tunnel._onMessage_');    		
    	}
    };
    tunnel._onOpen_ = function(data) {
        console.log('tunnel is open',data);
        tunnel.longPoll('utils.tunnel._onMessage_');
    };
    tunnel._onSent_ = function(data) {
        console.log('tunnel is open',data);
        tunnel.longPoll('utils.tunnel._onMessage_');
    };
    tunnel.longPoll = function(_cb_,handler,data) {
        $.ajax({
            url : 'tunnel.php?do='+(handler || 'getLPollData'),
            type    : 'POST',
            dataType: 'jsonp',
            jsonpCallback: _cb_,
            data: 'token=' + this.token +  '&counterStart=' +  this.counterStart + 
            '&counterEnd=' +  this.counterEnd + 
            '&counter=' + this.counter + 
            '&data='+utils.stringify(data || {})
        });
    };
    
    tunnel.sendLazy = function(eName, eData){
    	 return tunnel.longPoll('utils.tunnel._onMessage_','sendData',eData);
    };
    tunnel.triggerListener = function(eName, eData){
    	eventMap[eName] = eventMap[eName] || [];
    	for(var i in eventMap[eName]){
        	eventMap[eName][i](listner);
    	}
    };
    tunnel.addListener = function(eName, listner){
    	tunnel.open();
    	eventMap[eName] = eventMap[eName] || [];
    	eventMap[eName].push({
    		id : tunnel.eventCounter ,fun : listner
    	});
    	return tunnel.eventCounter++;
    };
    tunnel.removeListener = function (eName,listener) {
    	eventMap[eName] = eventMap[eName] || [];
    	if(listener){
	    	eventMap[eName] = $.grep(eventMap[eName], function (value) {
	          return !(value.fun == listener ||  value.id==listener);
	        });
    	} else {
    		delete eventMap[eName];
    	}
    };
    tunnel._ready_ = function(){
    	tunnel.token = window.token || (document.location.search.split('token=')[1] || '-1').split('&')[0];
    	console.log('tunnel.starting...hmmmm');
    	//tunnel.open();
    };
    
    tunnel.sub = tunnel.addListener;
    tunnel.unsub =  tunnel.removeListener;
    
    tunnel.send = function(OBJ){
        $.ajax({
            url : CONTEXT_PATH + 'data/'+(OBJ.api || ''),
            type    : 'POST',
            dataType: OBJ.dataType || "html",
            //jsonpCallback: _cb_,
            data: OBJ.data,
            success : function(rep){
            	if(OBJ.success) OBJ.success(rep);
            }
         });
    };
});