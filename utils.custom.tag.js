utils.define('utils.custom.tag').as(function(tag, _tag_) {

	var custom = utils.require('utils.custom');
	
	tag.ATTR = $.extend({
		DATA_PATH : 'data-path',
		DATA_ONCHANGE : 'data-onchange',
		DATA_FORMAT : 'data-format',
		DATA_ONCLICK : 'data-onclick'
	}, utils.config.TAG_ATTR);

	tag.EVENTS = $.extend({
		value_change : "_tag_onchange",
		buton_click : "_tag_onclick"
	}, utils.config.TAG_EVENTS);

	tag._ready_ = function() {

		$("body").on("change", "input.tag", function(e) {
			var $tag = $(this); // .parents('.tag');
			var tagType = $tag.attr('tagType');
			var tagParams;
			if (utils.custom[tagType] && utils.custom[tagType].getTagParam) {
				tagParams = utils.custom[tagType].getTagParam($tag);
			} else {
				tagParams = tag.getTagParam($tag);
			}
			tagParams.isValid = custom.validate($tag, tagParams);
			custom.dispatchEvent(this, tag.EVENTS.value_change, tagParams);
		});
		$("body").on("click", "[" + tag.ATTR.DATA_ONCLICK + "]", function(e) {
			var $tag = $(this); // .parents('.tag');
			var tagType = $tag.attr('tagType');
			var tagParams;
			if (utils.custom[tagType] && utils.custom[tagType].getTagParam) {
				tagParams = utils.custom[tagType].getTagParam($tag);
			} else {
				tagParams = tag.getTagParam($tag);
			}
			custom.dispatchEvent(this, tag.EVENTS.buton_click, tagParams);
		});
		
		$.fn.setValue = function(value) {
			if (this[0].tagName == 'INPUT' || this[0].tagName == 'SELECT') {
				this[0].value = value
			} else
				this[0].innerHTML = value;
		};

		$.fn.getValue = function() {
			return $(this).val();
		};
		var navigation = utils.require('utils.navigation');
	};
	//WIDGET*************************************************************************************
	tag.getTagParam = function($tag) {
		return {
			fieldType : $tag.attr('name') || $tag.attr('fieldType'),
			path : $tag.attr(tag.ATTR.DATA_PATH),
			method_onchange : $tag.attr(tag.ATTR.DATA_ONCHANGE),
			method_onclick : $tag.attr(tag.ATTR.DATA_ONCLICK),
			iVal : $tag.getValue()
		};
	};
    /**
     * @param $widget - widget, values if being changed for.
     * @param oMap - format 
     * @param preventPropagationOrForce - if not passed then onchange is triggered based on value, 
     * 			if true then onchange is triggered forcefully,if false then onchange is prevented 
     */
	tag.iVal = function($widget, oMap, preventPropagationOrForce,uE) {
        if (!$widget[0]) return false;
        var oldVal = $widget[0].getAttribute('data-ival') || '';
        var ev = (uE ? uE.set('name', 'change').set('props',oMap) : new custom.event('change', $widget, oMap));
        ev.oldVal = oldVal;
        ev.isValid = oMap.isValid;
        $widget[0].setAttribute('data-ival', oMap.iVal);
        var changed = (oldVal != oMap.iVal);
        if ((preventPropagationOrForce===undefined && changed) || (preventPropagationOrForce===true)) {
        	ev.mode = $widget[0].getAttribute('mode');
        	ev.tagType = $widget[0].getAttribute('tagType');
        	ev.fieldType = $widget[0].getAttribute('fieldType');
        	ev.iRow = $widget[0].getAttribute("iRow");
        	ev.iCol = $widget[0].getAttribute("iCol");
        	try{
        		$widget.trigger("_onchange_", ev, oMap);
        	} catch(ex){
        		console.error(ex)
        	}
        }
        return changed;
    };
});