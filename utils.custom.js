utils.define('utils.custom', function(custom) {
	custom._ready_ = function(){
		$("body").on("change","input.tag[formattype]", function(e){
			var $tag = $(this); //.parents('.tag');
			return custom.validate($tag);
		});
	};
	custom.validate = function($tag){
		var formatType = $tag.attr('formatType');
		if(formatType){
			var o = utils.format.get(formatType,{
				iVal : $tag.val()
			});
			custom.setError($tag,!o.isValid)
		}
	};
	custom.setWarning = function($tag,set){
		var $tagwrap = $tag.parent().removeClass('has-warning');
		if(set) $tagwrap.addClass('has-warning');
	};
	custom.setError = function($tag,set){
		var $tagwrap = $tag.parent().removeClass('has-error');
		if(set) $tagwrap.addClass('has-error');
	};
	custom.preventPropagation = function (event) {
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
});