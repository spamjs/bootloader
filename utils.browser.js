utils.define('utils.browser', function(custom) {

	if(!window.BrowserDetect){
		window.BrowserDetect = new (function(){
			this.isBelowIE9 = false;
		});
	}
	
	if(BrowserDetect.isBelowIE9){
		function CustomEvent ( event, params ) {
			   params = params || { bubbles: false, cancelable: false, detail: undefined };
			   var evt = document.createEvent( 'CustomEvent' );
			   evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
			   return evt;
		   };
		   CustomEvent.prototype = window.Event.prototype;
		   window.CustomEvent = CustomEvent;

	}
	
    if ('querySelector' in document){
        $.getFirst= function(selector,$c) { 
            if($c){
            	if($c[0]) return $($c[0].querySelector(selector))
            	return $();
            } return $(document.querySelector(selector))
        }
    } else {
        $.getFirst= function(selector,$c) {  
            return $(selector,$c).first();
        }
    }
	
	window.utils.preventPropagation = function(event) {
		if (!event)
			var event = window.event;
		if (event) {
			if (event.preventDefault) {
				event.preventDefault();
				event.cancelBubble = true;
				event.returnValue = false;
				event.stopPropagation && event.stopPropagation();
				event.stopImmediatePropagation
						&& event.stopImmediatePropagation();
			} else {
				event.cancelBubble = true;
				event.returnValue = false;
				event.stopPropagation && event.stopPropagation();
				event.stopImmediatePropagation
						&& event.stopImmediatePropagation();
				return false;
			}
		}
	};
});