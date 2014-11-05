utils.define('utils.custom', function(custom) {

	utils.require('utils.browser','utils.format');
	
	custom.getEvent = function(eName, _detail) {
		var detail = _detail || {};
		detail.navigate = true;
		detail.uEventName = eName;
		return new CustomEvent(eName, {
			detail : detail,
			bubbles : true,
			cancelable : true
		});
	};
	custom.getEventDetail = function(event) {
		if(event.uEvent) return event.uEvent.detail
		return event.originalEvent.detail;
	};
	custom.extendEvent = function(jQEvent,eName,_eData) {
		var eData = _eData || {};
		eData.key = (jQEvent.keyCode || jQEvent.which);
		jQEvent.uEvent = custom.getEvent(eName,eData);
		return jQEvent.uEvent;
	};
	custom.dispatchEvent = function(elem,eName,eData){
		return elem.dispatchEvent(custom.getEvent(eName,eData));
	};
	custom.validate = function($tag,tagParams) {
		if (tagParams.formatType) {
			var o = utils.format.get(tagParams.formatType, tagParams);
			custom.setError($tag, !o.isValid)
			return o.isValid;
		} return true;
	};
	custom.setWarning = function($tag, set) {
		var $tagwrap = $tag.parent().removeClass('has-warning');
		if (set)
			$tagwrap.addClass('has-warning');
	};
	custom.setError = function($tag, set) {
		var $tagwrap = $tag.parent().removeClass('has-error');
		if (set)
			$tagwrap.addClass('has-error');
	};
	custom.stop = custom.preventPropagation = function(event) {
		return utils.preventPropagation(event);
	};
	
	//NAVIGATION
	
});