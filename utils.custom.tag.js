utils.define('utils.custom.tag', function(tag) {

	var custom = utils.require('utils.custom');
	tag.DATA_PATH = 'data-path';
	tag.DATA_ONCHANGE = 'data-onchange';
	tag.DATA_FORMAT = 'data-format';
	
	tag._ready_ = function() {
		
		$("body").on("change", "input.tag", function(e) {
			var $tag = $(this); // .parents('.tag');
			var tagType = $tag.attr('tagType');
			var tagParams;
			if(utils.custom[tagType] && utils.custom[tagType].getTagParam){
				tagParams = utils.custom[tagType].getTagParam($tag);
			} else {
				tagParams = tag.getTagParam($tag);
			}
			tagParams.isValid = custom.validate($tag,tagParams);
			custom.dispatchEvent(this,'TagOnChange',tagParams);
		});
		$("body").on("click", "[data-onclick]", function(e) {
			var $tag = $(this); // .parents('.tag');
			custom.dispatchEvent(this,'ButtonOnClick',{
				isValid : valid
			});
		});
		
		$.fn.setValue = function(value){
			if(this[0].tagName=='INPUT' || this[0].tagName=='SELECT'){
				this[0].value = value
			} else this[0].innerHTML = value;	
		};
		
		$.fn.getValue = function(){
			return $(this).val();
		};
	};
	
	 tag.getTagParam = function($tag){
		 return { 
			 fieldType :  $tag.attr('name') || $tag.attr('fieldType'),
			 path : $tag.attr(tag.DATA_PATH),
			 change : $tag.attr(tag.DATA_ONCHANGE),
			 iVal : $tag.val()
		 };
	 };
	
});