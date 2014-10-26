utils.define("utils.xdm", function(xdm){
	
	xdm.setup = function() {
        if (window.addEventListener) {
                window.addEventListener ("message", xdm._onMessage, false);
        } else if (window.attachEvent) {  
                    window.attachEvent("onmessage", xdm._onMessage);
        }
	};
	xdm.events = {};
	xdm._onMessage = function(JSEventObject){ //THIS FUNCTION SIMPLY PROCESSES ANY MESSAGE RECIEVED FROM PARENT WINDOW by calling handlers
		var XDMEventObject = utils.parse(JSEventObject.data);
		var XDMEventName = XDMEventObject.XDMEventName;
		if(xdm.events[XDMEventName]){
			for(var i in xdm.events[XDMEventName])
				xdm.events[XDMEventName][i](XDMEventObject.message,XDMEventObject,JSEventObject); // mainMessage, XDMEventObject, JSEventObject
		}
	}
	xdm.onMessage = function(XDMEventName,callback){  ////THIS FUNCTION Sets Handlers for any message
		if(xdm.events[XDMEventName]==undefined)  xdm.events[XDMEventName] = [];
		xdm.events[XDMEventName].push(callback);
    };
    
    
    xdm.postMessage = function(XDMEventName,message,destinationFrame,URL){  //THIS FUNCTION SIMPLY SENDS A MESSAGE/JSON object TO PARENT WINDOW:
    	if(destinationFrame==undefined) var destinationFrame = window.parent;
    	try{
        	var destURL = (URL==undefined)? destinationFrame.location.href : URL;
        	var XDMEventObjectString = utils.stringify({
    			message : message,
    			frameURL : document.URL,
    			destinationURL : destURL,
    			XDMEventName : XDMEventName,
				windowName : window.windowName,
				windowID : window.windowID
    		});
    		destinationFrame.postMessage(XDMEventObjectString,destURL);
    	} catch(err){
    		LOG.error("XDM:ERROR:FRAMEURL",document.URL,err);
    	}
	};
	xdm.postMessageByFrameId = function(XDMEventName,message,destFrameID){
		var o = document.getElementById(destFrameID);
		if(o){
			var destinationFrame = o.contentWindow;
			//o.contentWindow.postMessage('Hello B', 'http://documentB.com/');
			xdm.postMessage(XDMEventName,message,destinationFrame,o.src);
			return true;
		} return false;
	 };
	xdm.setup();
});
