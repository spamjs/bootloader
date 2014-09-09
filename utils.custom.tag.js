utils.define('utils.custom.tag', function(tag) {

	var custom = utils.require('utils.custom');
	
	tag._ready_ = function() {
		
		$("body").on("change", "input.tag", function(e) {
			var $tag = $(this); // .parents('.tag');
			var valid = custom.validate($tag);
			custom.dispatchEvent(this,'TagOnChange',{
				valid : valid
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
});