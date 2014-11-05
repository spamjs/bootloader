utils.define('utils.abstracts.tag', function(tag,_tag_) {

	tag._on_focus = function(elem,uD,uE, e) {
		return 'select';
	};
	tag._on_blur = function(elem,uD,uE, e) {
		return 'none';
	};
	tag._on_keydown = function(elem,uD,uE, e) {
		if (utils.is.enter(uD.key)) {
			uD.key = utils.is.down();
			return 'select';
		} else if (uE.readOnly)
			return 'select';
		else
			return uE.mode;
	};
	tag._on_modechange = function(elem,uD,uE, e) {
		if (uD.readOnly)
			return 'select';
		if (uD.mode != 'select') {
			utils.custom.stop(e);
		}
	};
});