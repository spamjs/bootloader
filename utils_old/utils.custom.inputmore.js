utils.custom.defineWidget("button", function(button){
	button.tag = function(obj){
		var $button = new utils.custom.Tag('button',obj.fieldType);
		$button.setIndex(obj.tabIndex, obj.iRow, obj.iCol);
		$button.name = 'input';
		$button.singleTag = true;
		$button.attr("value",obj.value);
		$button.attr("type",'button');
		return $button;
	};
});

select_namespace("utils.custom.range", function(range){
	
	range.init = function(){
		$("body").delegate(".range.tag:not(.readOnly.yes) .up", "click", function(e){
			var $widget = $(this).parents(".tag");
			var step = $widget.attr('step');
			range.shift($widget,1*step); $(".value",$widget).change();
		});
		$("body").delegate(".range.tag:not(.readOnly.yes) .dwn", "click", function(e){
			var $widget = $(this).parents(".tag");
			var step = $widget.attr('step');
			range.shift($widget,-1*step); $(".value",$widget).change();
		});
		$("body").delegate(".range.tag:not(.readOnly.yes) .value", "blur", function(e){
			var $widget = $(this).parents(".tag");
			this.value = range.formatValue($widget,this.value)
		})
		$("body").delegate(".range.tag:not(.readOnly.yes)", "keydown", function(e){
			var $widget = $(this)
			var key = (e.keyCode || e.which);
			var step = $widget.attr('step');
			if(key==38) range.shift($widget,1*step);
			else if(key==40) range.shift($widget,-1*step);
			else if(!utils.isNumKey(key,e) && !isDecimalKey(key,e)){
				preventPropagation(e);
			} else {
				var $VAL = $(".value",$widget);
				var val = $VAL.val();
				if(val && isDecimalKey(key,e) && val.indexOf('.')!=-1){
					preventPropagation(e);
				}
			}
		});
		$("body").delegate(".range.tag:not(.readOnly.yes)", "keyup", function(e){
			var $widget = $(this)
			var key = (e.keyCode || e.which);
			if(key==38 || key==40 || key==13){
				var $VAL = $(".value",$widget); var val = $VAL.val();
				$VAL.val(range.formatValue($widget,val))
				$VAL.change();
				preventPropagation(e);
			}
		});
	};
	range.formatValue = function($widget,value){
		var maxValue = $widget.attr('maxValue');
		if(isNaN(value)) value = 0;
		if(maxValue!==undefined){
			if(Number(maxValue)<value) value = maxValue;
		} return value;
	} 
	range.shift = function($widget,margin){
		var $VAL = $(".value",$widget);
		var val = $VAL.val()-0+margin;
		return $VAL.val(range.formatValue($widget,val))
	}
});

function isDecimalKey(key,e) {
	return key===110 ||(key===190 && !e.shiftkey)
	
}

function getTitleCase(str){
	return str.substr(0,1).toUpperCase()+str.substr(1).toLowerCase();
};

function getFieldHeader(str){
	return utils.messages[str];
};

select_namespace("utils.custom.arrowtoggle", function(arrowtoggle){
	arrowtoggle.tag = function(obj){
		var $tag = utils.custom._tag(obj);
		$tag.append(obj.value+'<a class="dropdownArrow" tabindex=-1>^</a>');
		return $tag;
	};
});
