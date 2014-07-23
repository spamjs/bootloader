utils.custom.defineWidget("inputbox", function(inputbox){
	
	inputbox.extendAttrs(['minValue','maxValue','isPositive','nonZero','round','minValueExpr',
            'minlength','maxlength','regex','regexmsg','suffix_hide','limit','digit','placeholder']);

	inputbox.on("input.display", "change", function(e,uE){
		inputbox.on_displaychange(uE,e);
	});
	
	inputbox.on(".display", "dblclick", function(e,uE){
		//uE.key = utils.is.enter();
		//uE.name = 'keydown';
		//utils.custom.navigation.tagEventHandler(uE.$widget[0],uE,e,'select');
		utils.custom.navigation.to_mode_change(uE.$widget[0],'edit',uE,e);
	});
	
	inputbox.getValueMap = function(elem,iVal,dVal){
		var formatObj = this.getAttributes(elem);
		formatObj.iVal =iVal; formatObj.dVal =dVal;
		return utils.format.get(formatObj.formatType,formatObj).prop('onerror',formatObj.onerror);
	};
	
   inputbox.on_displaychange = function(uE, e) {
        var $widget = uE.$widget;//$this.parents(".tag");
        var $display = $("input.display", $widget);
        var enteredVal = $display.val();
        var oMap = this.getValueMap($widget, undefined, enteredVal);
        if (!oMap.isValid) {
            if (oMap.onerror)
                oMap.iVal = oMap.dVal;
            $widget.setInvalid(oMap.reason, true);
        } else {
            $widget.setInvalid();
        }
        var changed = utils.custom.iVal($widget, oMap);
        $display.val(oMap.dVal);
        $("div.display", $widget).text(oMap.dVal);
        return;
    };
	
	inputbox.tag = function(obj){
		var $tag = utils.custom._tag(obj);
		if(obj.value===undefined) obj.value = "";
		obj._display = obj.value;

		if(obj.formatType){
			obj.attr.formatType = obj.formatType;
			obj.iVal = obj._display; 
			var _display = utils.format.get(obj.formatType,obj);
			obj._display = _display.dVal;
			obj.attr.title = _display.tVal;
		}else if(obj.round!==undefined){
			var _display = utils.math.getRoundValue(obj.value,obj.round);
			obj._display = utils.math.afterDecimal(_display,obj.round);
		}
		this.setAttributes($tag,obj);
		
		$tag.append(utils.custom._display(obj));
		//$tag.append(utils.custom._input(obj));
		if(obj.attr.title==undefined){
			obj.attr.title = obj._display;
		}
		if(obj.$append){
			obj.$append.row = obj.row; obj.$append.col = obj.col;
			$tag.append(utils.custom.tag(obj.$append));
		}
		//$tag.setValue(obj.value);
		return $tag;
	}
//	inputbox.getValue = function(elem, attr){
//		if(attr===undefined){
//			var val = $("input.value", elem).val();
//			if(val!=="" && !isNaN(val) && !elem.hasClass('regex')) return val-0;
//			return val;
//		} else return $("input.value", elem).attr(attr);
//	};
	inputbox.setValue = function(elem, value){
		var dispVal = value;
		var vMap = this.getValueMap(elem,value);
		elem.setDisplay(vMap.dVal,vMap.tVal);
		if(!vMap.isValid){
			elem.setError(vMap.reason);
		}
		return vMap.iVal;
	};
	var inputBoxEditing = true;
    inputbox.isTargetDisplay = function(e) {
        return (e.target.nodeName.toUpperCase() == 'INPUT' && e.target.className.indexOf('display') != -1)
    }
    inputbox.on_focus = function(elem, uE, e) {
        inputBoxEditing = this.isTargetDisplay(e);
        if (uE.mode == 'edit') {
            return uE.mode
        } else
            return 'select';
    }
    inputbox.on_blur = function(elem, uE, e) {
        inputBoxEditing = !this.isTargetDisplay(e);
        if (uE.mode == 'edit' && inputBoxEditing) {
            return uE.mode
        }
        return 'none';
    }
    inputbox.on_keydown = function(elem, uE, e) {
        if (utils.is.enter(uE.key)) {
        	uE.key = utils.is.down(); return 'select';
        } else if(uE.readOnly){
        	return 'select';
        } else if (uE.mode == 'select' && !utils.is.nav(uE.key)) {
        	return 'edit';
        } else if(uE.mode == 'edit' && (utils.is.down(uE.key) || utils.is.up(uE.key))){
        	return 'select';
        } else if(utils.is.nav(uE.key)){
        	return 'select';
        }
        return uE.mode;
    };
    inputbox.on_modechange = function(elem,uE,e){
    	if(uE.mode=='edit' && !uE.readOnly){
    		if(uE.name=='dblclick'){
    			$("input.display", elem).setCursorPosition(uE.$widget.getMouseTextPositionIndex(e),-1);
    		} else $("input.display", elem).focusin().select();
    	}
    };
	inputbox.onKeyPress = function(elem, cb){
		var $widgetDiv = $(elem);
		if(cb==undefined){
			return $("input.value", $widgetDiv).change();
		}
		$widgetDiv.addClass("onchange");
	    return $("input.value", $widgetDiv).change(function(e){
	    	var $thisWidget = $(this).parents(".tag");
	    	e.$widget = $thisWidget;
	        if(cb){
	        	cb(e,$thisWidget);
	        }
	    });	
	};
});


utils.custom.defineWidget("amount").from('inputbox').as(function(amount){
	//amount.extendAttrs(['minValue','maxValue','minValueExpr','minlength','maxlength']);

	amount.override('tag',function(obj){
		var $tag = this.super.tag(obj);
		var toggle = new utils.custom.Tag('toggle',obj.fieldType+'_cur');
		toggle.setIndex($tag.tabIndex+'.1', $tag.iRow+'_1', $tag.iCol+'_1');
		
		var optionString = '';
		var valueSet = false;
		var value = obj.optionValue;
		for(var i in obj.options){
			var hide = 'dn';
			if(!value){ value = i; } if(value==i){hide=''; }
			optionString+=('<div data-display="'+obj.options[i]+'" data-value="'+i+'" class="option '+hide+'">'+obj.options[i]+'</div>')
		};
		toggle.append(optionString);
		$tag.append(toggle);
		return $tag;
	});
	
	amount.getValueMap = function(elem,iVal,dVal){
		var formatObj = this.getAttributes(elem);
		formatObj.iVal =iVal; formatObj.dVal =dVal;
		return utils.format.get(formatObj.formatType || 'amount',formatObj).prop('onerror',formatObj.onerror);
	};
	
	amount.on_keydown = function(elem, uE, e) {
        if (utils.is.enter(uE.key)) {
        	if(uE.mode != 'edit'){
        		//uE.$widget = $('.toggle',elem);
     			var $option = utils.custom.toggleOption($('.option',elem),'option');
     			utils.custom.iVal($('.toggle',elem), new utils.format.defMap($option.attr('data-value') ,$option.attr('data-value') ));
        	}
        	return 'select';
        } else if ((uE.mode == 'select' || uE.mode == 'none') && !utils.is.nav(uE.key)) {
        	return 'edit';
        } else if(uE.mode == 'edit' && (utils.is.down(uE.key) || utils.is.up(uE.key))){
        	return 'select';
        } else if(utils.is.nav(uE.key)){
        	return 'select';
        }
        return uE.mode;
    };
});
