select_namespace("utils.custom.toggle", function(toggle){

	toggle.tag = function(obj){
		var $tag = utils.custom._tag(obj);
		if(obj.value===undefined) obj.value = "";
		obj._inputClass="toggleValue";
		$tag.append(utils.custom._input(obj));
		toggle.setParams($tag,obj);
		obj._parentDivClass = obj._parentDivClass + " noentertext";
		return $tag;
	};
	
	toggle.init = function(){
		$("body").delegate(".toggle.tag:not(.readOnly)", "click", function(e){
			var $this = $(this);
			$this.toggleChange();
			preventPropagation(e);
			return;
		});
		$("body").delegate(".toggle.tag:not(.readOnly)", "keydown", function(e){
			var $this = $(this);
			var key = (e.keyCode || e.which);
			if(key==13){
				$this.toggleChange();
				preventPropagation(e);
			}
			return;
		});
	};
	
	toggle.onChange = function(elem, cb){
		var $widgetDiv = $(elem);
		if(cb==undefined){
			var $input = $("input.toggleValue", $widgetDiv)
			try{
				$input.addClass('curChange');
				return $input.change()
			} finally {
				$input.removeClass('curChange');
			}
		}
		$widgetDiv.addClass("onchange");
	    return $("input.toggleValue", $widgetDiv).change(function(e){
	    	var $thisWidget = $(this).parents(".tag.toggle");
	    	if($thisWidget.hasClass("readOnly") && $thisWidget.hasClass("yes")) return;
	        if(cb && $thisWidget.isValid()){
	        	e.$widget = $thisWidget;
	        	cb(e,$thisWidget);
	        }
	    });	
	};
	
	toggle.setParams = function($widget, params){
		var j = 0;
		$(".option",$widget).remove();
		var _val=params.value;
		for(var i in params.options){
			$widget.append('<div data-display="'+params.options[i]+'" data-value="'+i+'" class="option dn">'+params.options[i]+'</div>');
			j++; if(j==0) _val = i;
		}
		if(!_val){
			params.value = _val;
		}
		if(params.value)
			$widget.setValue(params.value);
	};
	
	$.fn.toggleChange = function(e){
		var $this = this;
		var $curOption = $(".option:not(.dn)", $this);
		var $nextOption = $curOption.next();
		if(!$nextOption.length || !$nextOption.hasClass("option")) $nextOption = $(".option:eq(0)", $this);
		$(".option", $this).addClass("dn");
		var value = $nextOption.removeClass("dn").attr("data-value");
		$("input.toggleValue", $this).val(value);
		toggle.onChange(this)
		//$("input.toggleValue", $this).change();
		//preventPropagation(e);
	};
	$.fn.getToggleValue = function(){
		return $("input.toggleValue", this).val();
	};
	
});