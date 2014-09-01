utils.define('utils.custom.tag', function(tag) {

	var custom = utils.require('utils.custom');
	
	tag._ready_ = function() {
		$("body").on("change", "input.tag", function(e) {
			var $tag = $(this); // .parents('.tag');
			var valid = custom.validate($tag);
			this.dispatchEvent(custom.getEvent('TagOnChange',{
				valid : valid
			}));
		});
	};

});