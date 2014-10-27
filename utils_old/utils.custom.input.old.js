select_namespace("utils.custom.inputbox", function(inputbox){
	
	$.fn.setRoundValue = function(round){
		this.addClass("round");
		this.attr("round",round)
		$("input.display",this).attr("round",round);
	};
	inputbox.tag = function(obj){
		var $tag = utils.custom._tag(obj);
		if(obj.value===undefined) obj.value = "";
		obj._display = obj.value;
//		if(obj.percent){
//			obj._parentDivClass = obj._parentDivClass + " percent";
//			if(obj.value!==""){
//				obj._display = utils.math.toPercentFormat(obj.value,4);
//			}
//		}
		if(obj.round!==undefined){
			obj._parentDivClass = obj._parentDivClass + " round";
			obj.attr.round = obj.round;
//			obj._display = utils.math.afterDecimal(obj.value,obj.round);
		}
		if(obj.formatType){
			obj.attr.formatType = obj.formatType;
			//obj._parentDivClass = obj._parentDivClass + " " + obj.formatType;
			obj.iVal = obj._display; 
		//	if(obj.formatType== "delta") console.log(' hasClass formatType Delta _val ...',obj)
			var _display = utils.format.get(obj.formatType,obj);
		//	if(obj.formatType== "delta")  console.log(' hasClass formatType Delta _display ...',_display)
			obj._display = _display.dVal;
			obj.attr.title = _display.tVal;
		}else if(obj.round!==undefined){
			var _display = utils.math.getRoundValue(obj.value,obj.round);
			obj._display = utils.math.afterDecimal(_display,obj.round);
		}
		if(obj.minValue){
			obj._parentDivClass = obj._parentDivClass + " minValue";
			obj.attr.minValue = obj.minValue;
		}
		if(obj.maxValue){
			obj._parentDivClass = obj._parentDivClass + " maxValue";
			obj.attr.maxValue = obj.maxValue;
		}
		if(obj.placeholder && obj.placeholder != ""){
			obj._parentDivClass = obj._parentDivClass + " placeholder";
			obj.attr.placeholder = obj.placeholder;
		}
		obj._disAttr = '';
		if(obj.maxlength){
			obj._disAttr = ' maxlength=' +obj.maxlength + ' ';
		}
		//**************************//
		if(obj.minlength){
			obj._parentDivClass = obj._parentDivClass + " minlength";
			obj.attr.minlength = obj.minlength;
		}
 		if(obj.maxlength){
			obj._parentDivClass = obj._parentDivClass + " maxlength";
			obj.attr.maxlength = obj.maxlength;
		}
		if(obj.regex){
			obj._parentDivClass = obj._parentDivClass + " regex";
			obj.attr.regex = obj.regex;
		}
		if(obj.regexmsg){
			obj._parentDivClass = obj._parentDivClass + " regexmsg";
			obj.attr.regexmsg = obj.regexmsg;
		}
		//**************************//
		if(obj.delta)
			obj._parentDivClass = obj._parentDivClass + " delta";
		
		$tag.append(utils.custom._display(obj));
		$tag.append(utils.custom._input(obj));
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
	
	inputbox.valueOnChange = function($this,e){
		var $widget =$this.parents(".tag");
		var enteredVal = $("input.display",$widget).val();
		//$("input.value",$widget).val(enteredVal);
		//if(enteredVal!= undefined && enteredVal!=="") $widget.blur();
		var vMap = inputbox.getValueMap($widget,undefined,enteredVal);
		//console.log('valueOnChange ',vMap)
		//$("input.display",$widget).val(vMap.iVal);
		var fireOnChange = false;
		$("input.value",$widget).val(vMap.iVal);
		if(!vMap.isValid){
			$widget.setInvalid(vMap.reason, true);
			utils.custom.checkOnErrorTrigger($widget,e);
		} else if(!inputbox.isValid($widget,enteredVal) && !vMap.isValid){
			//console.log('valueOnChange ',enteredVal)
			$widget.setInvalid(i18n("ui.invalidInputs"), true);
		} else {
			$widget.setInvalid();
			if($this.valueChange(true)){
				fireOnChange = true;
			}
		}
		$widget.setDisplay(vMap.dVal,vMap.tVal);
		if(fireOnChange){
			preventPropagation(e);
			$widget.onChange();
		}
	}
	inputbox.init = function(){
		$("body").delegate("div.tag.inputbox input.display", "change", function(e){
			var $this = $(this);
			return inputbox.valueOnChange($this,e)
		});
	};
	
	inputbox.getValueMap = function(elem,iVal,dVal){
		var isValid = true;
		var reason = "";
		var formatType = elem.attr("formatType");
		var formatObj = {};
		formatObj.minValue = elem.attr("minValue");
		formatObj.maxValue = elem.attr("maxValue");
		formatObj.isPositive =elem.attr("isPositive");
		formatObj.nonZero =elem.attr("nonZero");
		//if(formatType== "delta")  console.log(' hasClass formatType Delta _display ...',elem)
		//if(elem.hasClass("round"))
			formatObj.round = elem.attr("round");
		formatObj.minValueExpr = elem.attr("minValueExpr");
		//if(elem.hasClass("minlength"))
			formatObj.minlength = elem.attr("minlength");
		//if(!formatObj.minlength) 
			formatObj.minlength = elem.attr("minlength")-0;
		///if(elem.hasClass("maxlength"))
			formatObj.maxlength = $("input.display",elem).attr("maxlength")-0;
			if(!formatObj.maxlength) formatObj.maxlength = elem.attr("maxlength");
		if(elem.hasClass("regex")){
			formatObj.regex = elem.attr("regex");
			formatObj.regexmsg = elem.attr("regexmsg");
		}
		if(elem.hasClass("suffix_hide"))	
			formatObj.suffix =  $("input.display",elem).attr("suffix");
		formatObj.limit = elem.attr("limit");
		formatObj.digit = elem.attr("digit");
		var fieldType = elem.attr("fieldType");
		if(formatType && utils.format.hasMap(formatType)){
			formatObj.iVal =iVal; formatObj.dVal =dVal; formatObj.fieldType = fieldType;
			return utils.format.get(formatType,formatObj)
		}
		if(iVal!==undefined){
			var dVal = iVal;
			iVal = iVal + "";
			if(iVal!==""){
				if(elem.hasClass("maxlength")){
					var ml = $("input.display",elem).attr("maxlength")-0;
					dVal = (iVal+"").substr(0,ml);
					iVal=dVal;
				}
				if(elem.hasClass("suffix_hide")){
					var suffix = $("input.display",elem).attr("suffix");
					dVal = iVal.replace(suffix, "");
				} 
				if(elem.hasClass("percent")){
					if(iVal!==""){
						dVal = utils.math.toPercentFormat(iVal,4);
					}
				} 
				if(elem.hasClass("decimal")){
					if(iVal!==""){
						//dispVal = utils.math.toPercentFormat(value,4);
						iVal = utils.math.toDecimalNumber(iVal,4);
					}
				} 
				if(elem.hasClass("round")){
					//var r = $("input.display",elem).attr("round")-0;
					var r=elem.attr("round")-0;
					if(r==undefined || isNaN(r)) r = 2;

					if(iVal!==""){
						iVal = iVal-0;
						dVal  = utils.math.getroundvalue(iVal,r);
						dVal = utils.math.afterDecimal(dVal,r);
					} else dVal = "";
				}
				var formatType = elem.attr("formatType");
				if(formatType) {
					dVal = utils.format.get(formatType,iVal,formatObj);
					if(formatObj.iVal!==undefined) iVal = formatObj.iVal;
				}
			} else {
				dVal = ""; iVal = "";
			}

		} else if(dVal!==undefined){
			var iVal = dVal;
			if(elem.hasClass("integer")){
				//TODO:- not decided yet what to do
			}
			if(elem.hasClass("percent")){
				if(dVal!==""){
					dVal = utils.math.removePercent(dVal);
					if(isNaN(dVal)){
						iVal = "";
						isValid = false;
						reason = "ui.invalidInput";
					} else {
						dVal = utils.math.toPercentFormat(dVal+"%",4);
						iVal = utils.math.toDecimalFormat(dVal);
					}
				}
			} else if(elem.hasClass("suffix_hide")){			
				if(dVal===null || (dVal==undefined) || dVal==="")
					iVal = "";
				else {
					var suffix = $("input.display",elem).attr("suffix");				
					iVal = dVal + suffix;
				}
			} else if(formatType) {
				var _dVal = utils.format.get(formatType,dVal,formatObj);
				if(_dVal==="" && dVal!==""){
					isValid = false; reason = "ui.invalidInput";
				} else dVal = _dVal;
				
				if(formatObj.iVal!==undefined) iVal = formatObj.iVal;
			}
		} else {
			var dVal = ""; var iVal = "";
		}
		var fieldType = getFieldHeader(elem.attr("fieldType"));
		var retMap = { dVal : dVal , iVal : iVal, isValid : isValid, reason : reason }
		if(retMap.isValid && elem.hasClass("maxValue") && dVal!==""){
			var maxValue = elem.attr("maxValue");
			if((maxValue - 0) < (iVal - 0)){
				var _maxValue = utils.format.get(formatType,maxValue,formatObj);
				retMap.isValid = false; 
				if(fieldType!==undefined)
					retMap.reason = "ui.error.incorrect"+fieldType+"InputValueGrtThan$1:"+_maxValue;
				else
					retMap.reason = "ui.error.incorrectInputValueGrtThan$1:"+_maxValue;
			}
		}
		if(retMap.isValid && elem.hasClass("minValue") && dVal!==""){
			var minValue = elem.attr("minValue");
			if((minValue-0)>(iVal-0)){
				var _minValue = utils.format.get(formatType,minValue,formatObj);
				retMap.isValid = false; 
				if(fieldType!==undefined)
					retMap.reason = "ui.error.incorrect"+fieldType+"InputValueLesThan$1:"+_minValue;
				else
					retMap.reason = "ui.error.incorrectInputValueLesThan$1:"+_minValue;
			}
			
		}
		//MinLen
		if(retMap.isValid && elem.hasClass("minlength") && dVal!==""){
			var minl = $("input.display",elem).attr("minlength")-0;
			if(minl>iVal.length || minl>dVal.length) {
				retMap.isValid=false;
				retMap.reason = "ui.invalidInput"; //"inputsTooShort$1:"+minl;
			}
		}
		return retMap;
	};
	inputbox.getValue = function(elem, attr){
		if(attr===undefined){
			var val = $("input.value", elem).val();
			if(val!=="" && !isNaN(val) && !elem.hasClass('regex')) return val-0;
			return val;
		} else return $("input.value", elem).attr(attr);
	};
	inputbox.setValue = function(elem, value){
		var dispVal = value;
		var vMap = inputbox.getValueMap(elem,value);
		
//		$("input.display", elem).val(dispVal);
//		$("input.display", elem).attr("oldval",dispVal);
		elem.setDisplay(vMap.dVal,vMap.tVal);
		if(!vMap.isValid){
			elem.setError(vMap.reason);
		}
		return vMap.iVal;
	};
	inputbox.isValid = function($widget,dVal){
		var iVal = $("input.value",$widget).val();
		if($widget.hasClass("helptext") && $widget.attr("help")==iVal){
			return true;
		} else if($widget.hasClass("delta")){
			//console.log(' hasClass Delta _val ...',$widget)
			if(isNaN(dVal)){
				var delta = dVal;
				if(delta){
		    		var delta = delta.toLowerCase().replace('d','').replace('atms','').replace('atmf','').replace('atm','');
		    		return (!isNaN(delta))
				} return true;
			} else {
				if(utils.math.getNumberType(dVal)=="expo"){
					return false;
				}
				return true;
			}
		} else if($widget.hasClass("percent")){
			if(isNaN(iVal)){
				var delta = dVal;
				if(delta){
		    		var delta = delta.toLowerCase().replace('%','');
		    		return (!isNaN(delta))
				} return true;
			} else return true;
		} else if($widget.hasClass("integer")) {
				if(!isNaN(dVal)){
					if(iVal.indexOf(".")==-1) return true;
				} return false
		} else if($widget.hasClass("atmstrike")) {
			if(isNaN(dVal)){
				var delta = dVal;
				if(delta){
		    		var delta = delta.toLowerCase().replace('atm','');
		    		if(!isNaN(delta) && delta>=0){
		    			return true;
		    		}
				} return false;
			} else return (dVal>0);
		} else if($widget.hasClass("number")
				||$widget.hasClass("strike")
				||$widget.hasClass("spot")
				||$widget.hasClass("barrier")
				||$widget.hasClass("barrier_up")
				||$widget.hasClass("barrier_down")
				||$widget.hasClass("trigger")
				||$widget.hasClass("trigger_up")
				||$widget.hasClass("trigger_down")
				||$widget.hasClass("upper_level")
				||$widget.hasClass("lower_level")
				||$widget.hasClass("in_level")
				||$widget.hasClass("out_level")
				||$widget.hasClass("strike_itm")
				||$widget.hasClass("strike_otm")){
			if(!isNaN(dVal)){
				if(utils.math.getNumberType(dVal)=="expo"){
					return false;
				}
				return true;
			}
			else return false;
		} else if($widget.hasClass("tenor")){
			if(dVal){
	    		var m = dVal.match(/^[1-9][0-9]*[dwmyDWMY]$/);
		    	if(m && m.length == 1) return true;
		    	return false;
			} else return true;
		} else if($widget.hasClass("swaptenor")){
			if(dVal){
	    		var m = dVal.match(/^[1-9][0-9]*[myMY]$/);
		    	if(m && m.length == 1) return true;
		    	return false;
			} else return true;
		} else if($widget.hasClass("buisday")){
			if(dVal){
				//var iVal = $widget.getValue();
				//var tenor = $("input.value", $widget).val();
	    		var m = dVal.match(/^[1-9][0-9]*[bB]*[dD]$/);
		    	if(m && m.length == 1) return true;
				return false;
			} else return true;
		} else if($widget.hasClass("email")){
			if(dVal){
				//var iVal = $widget.getValue();
				//var tenor = $("input.value", $widget).val();
	    		var m = dVal.match(/^\s*[\w\-\+_]+(\.[\w\-\+_]+)*\@[\w\-\+_]+\.[\w\-\+_]+(\.[\w\-\+_]+)*\s*$/);	    				
		    	if(m && m.length) return true;
				return false;
			} else return true;
		}
		else if($widget.hasClass("phone")){
			if(dVal){				
				var regex = /^[0-9+()-]*$/;
				var m = regex.test(dVal);	    		
		    	if(m) return true;
				return false;
			} else return true;
		}
		else if($widget.hasClass("name")){
			if(dVal){				
				var regex = /^([^0-9]*)$/;
				var m = regex.test(dVal);	    		
		    	if(m) return true;
				return false;
			} else return true;
		}
		else if($widget.hasClass("alphanumeric")){
			if(dVal){				
				var regex = /^[a-zA-Z0-9]*$/;
				var m = regex.test(dVal);	    		
		    	if(m) return true;
				return false;
			} else return true;
		}
		else if($widget.hasClass("alphanumericSpace")){
			if(dVal){				
				var regex = /^[\s]*[a-zA-Z][a-zA-Z0-9\s]*$/;
				var m = regex.test(dVal);	    		
		    	if(m) return true;
				return false;
			} else return true;
		}
		else if($widget.hasClass("onlySpecialCharsNotAllowed")){
			if(dVal){				
				var regex = /^[^a-zA-Z0-9]*$/;
				var m = regex.test(dVal);	    		
		    	if(!m) return true;
				return false;
			} else return true;
		}
		else if($widget.hasClass("webAddr")){
			if(dVal){				
				var regex = /^www.[a-z0-9_-]+(\.[a-z]{2,6}){1,2}$/;
				var m = regex.test(dVal);	    		
		    	if(m) return true;
				return false;
			} else return true;
		}
		else if($widget.hasClass("atmmoneyness")){
			if(dVal){
				var moneyness = dVal.toLowerCase().replace(/\s/g, '');
				var regex = /^(([0-9]+([\.][0-9]+)?)|([aA][tT][mM](([+]|[-])[0-9]+([\.][0-9]+)?)*))$/;
				var m = regex.test(moneyness);
		    	if(m) return true;
				return false;
			} else return true;
		}
		return true;
	};
	
	inputbox.onChange = function(elem, cb){
		var $widgetDiv = $(elem);
		if(cb==undefined){
			return $("input.value", $widgetDiv).change();
		}
		$widgetDiv.addClass("onchange");
	    return $("input.value", $widgetDiv).change(function(e){
	    	var $thisWidget = $(this).parents(".tag");
	    	e.$widget = $thisWidget;
	    	//TODO:-@lalit:to be removed after delegation updates.
	    	e.isValidInput = !e.$widget.hasError();
	        if(cb){
	        	cb(e,$thisWidget);
	        }
	    });	
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

select_namespace("utils.custom.amount", function(amount){
	
	amount.tag = function(obj){
		var $tag = utils.custom._tag(obj);
		if(obj.value===undefined) obj.value = "";

		if(!obj.formatType) obj.formatType = 'amount';
		obj.attr.formatType = obj.formatType;
		
		var vMap = utils.format.get(obj.formatType,{
			iVal :  obj.value,
			maxValue : obj.maxValue,
			minValue : obj.minValue,
			minValueExpr : obj.minValueExpr,
			maxlength : obj.maxlength,
			curValue :  obj.curValue,
			limit : obj.limit
		});
		
		obj._display = vMap.dVal;
		obj.value = vMap.iVal;
		//obj.limit=vMap.limit;
		var $cur = utils.custom.tag({
			tagType : "toggle",
			parentDivClass : "amount_toggle",
			fieldType: obj.fieldType + "_cur",
			options : obj.options,
			noNavIndex : true,
			value : obj.curValue,
			tabIndex : obj.tabIndex + ".2"
			//onChange : obj.CurOnChange
		})
		
		obj.tabIndex =obj.tabIndex + ".1";
		$tag.append(utils.custom._display(obj));
		$tag.append(utils.custom._input(obj));
		obj._parentDivClass = obj._parentDivClass + " noentertext";
		
		$tag.append($cur);
		return $tag;
	};

	amount.init = function(){
		$("body").delegate(".tag.amount:not(.inputbox) input.display", "change", function(e){
			//return utils.custom.inputbox.valueOnChange( $(this),e)
			var $widget = $(this).parents(".tag");
			amount.on_display_blur($widget);
		});
//		$("body").delegate(".tag.amount:not(.inputbox) input.toggleValue", "change", function(e){
//			var $widget = $(this).parents(".tag.amount");
//			amount.on_display_blur($widget);
//		});
	};
	amount.readAmountValues = function($widget,options){
		if(!options) var options = {};
		options.maxValue = $widget.attr("maxValue");
		options.minValue = $widget.attr("minValue");
		options.minValueExpr = $widget.attr("minValueExpr");
		options.maxlength = $widget.attr("maxlength");
		options.fieldType = $widget.attr("fieldType");
		options.curValue = $("input.toggleValue", $widget).val();
		options.limit = $widget.attr("limit");
		return options
	};
	amount.setValue = function($widget,value){
		//var x = utils.math.KMBTFormat(value);
		var formatType = $widget.attr("formatType");
		if(!formatType) formatType = 'amount';
		var vMap = utils.format.get(formatType,amount.readAmountValues($widget,{
			iVal :  value
		}));
		$("input.display",$widget).val(vMap.dVal);
		$("div.display",$widget).text(vMap.dVal);
		$widget.attr("title",vMap.tVal);
		if(!vMap.isValid){
			$widget.setInvalid(vMap.reason);
		}
		return vMap.iVal;
	};
	
	amount.on_display_focus = function($widget){
		var val = $("input.value", $widget).val();
		var netVal = utils.math.removeCommas(val); 
		$("input.display", $widget).val(netVal);
	};
	amount.on_display_blur = function($widget){
		var val = $("input.display", $widget).val();
		if($widget.hasClass("maxlength") && val!==""){
			var ml = $("input.display",$widget).attr("maxlength")-0;
			val = (val+"").substr(0,ml);
		}
		var $input = $("input.value", $widget);
		var _iVal = $input.val();
		var formatType = $widget.attr("formatType");
		if(!formatType) formatType = 'amount';
		var vMap = utils.format.get(formatType,amount.readAmountValues($widget,{
			dVal :  $("input.display", $widget).val()
		}));
		$widget.setDisplay(vMap.dVal,vMap.tVal);
		$input.val(vMap.iVal);
		if(vMap.isValid && vMap.iVal!=_iVal){
			amount.onChange($widget, undefined);
			$widget.setInvalid();
		} else if(!vMap.isValid){
			$widget.setInvalid(vMap.reason, true);
			utils.custom.checkOnErrorTrigger($widget,{})
		}
	};
	amount._validate = function($widget, dVal, iVal){
		var vMap = amount.validation_map($widget,dVal,iVal);
		if(!vMap.isValid){
			$widget.setInvalid(vMap.reason, true);
			utils.custom.checkOnErrorTrigger($widget,{})
		} else $widget.setInvalid();
		return vMap.isValid;
	};
	amount.validate = function($widget){
		var dVal = $("input.display", $widget).val();
		var iVal = $("input.value", $widget).val();
		return amount._validate($widget, dVal, iVal);
	};
	amount.validation_map = function($widget,dVal,iVal){
		dVal = utils.math.removeCommas(dVal);
		var retMap = { isValid : true };
		if(isNaN(dVal)){
    		var m = dVal.match(/^[+-]?[0-9]*\.?[0-9]*[mMkKbBtT]?$/);
	    	if(m && m.length == 1) {
	    	} else retMap = { isValid : false, reason : "ui.invalidInput" };
		}
		var amtType = $widget.attr("fieldType");
		if(retMap.isValid && $widget.hasClass("maxValue")){
			var maxValue = $widget.attr("maxValue");
			if((maxValue-0)<(iVal-0)){
				var reason = "ui.error.incorrect"+amtType+"AmountValueGrtThan$1:"+maxValue;
				retMap = { isValid : false, reason : reason };
			}
		}
		if(retMap.isValid && $widget.hasClass("minValueExpr")){
			var minValueExpr = $widget.attr("minValueExpr");
			var minValue = $widget.attr("minValue");
			if(!minValue) minValue = 0;
			if(eval(iVal+''+minValueExpr)){
				var reason = "ui.error.incorrect"+amtType+"AmountValueLesThan$1:"+minValue;		
				retMap = { isValid : false, reason : reason };
			}
		}else if(retMap.isValid && $widget.hasClass("minValue")){
			var minValue = $widget.attr("minValue");
			if((minValue-0)>=(iVal-0)){
				var reason = "ui.error.incorrect"+amtType+"AmountValueLesThanEqual$1:"+minValue;		
				retMap = { isValid : false, reason : reason };
			}
		}
		return retMap
	};
	
	amount.isValid = function($widget){
		var dVal = $("input.display", $widget).val();
		var iVal = $("input.value", $widget).val();
		return amount.validation_map($widget,dVal,iVal).isValid;
	};
	amount.onChange = function(elem, cb){
		var $widgetDiv = elem;
		if(cb==undefined){
			return $("input.toggleValue",$widgetDiv).change();
		}
	    return $("input.toggleValue", $widgetDiv).change(function(e){
	    	var $this = $(this);
	    	var $thisWidget = $this.parents(".tag.amount");
	    	e.hasCur = true;  e.curValue = $thisWidget.getToggleValue();
	    	e.$widget = $thisWidget;
	    	e.curChange = $this.hasClass('curChange');
	    	if(cb){
	        	cb(e,$thisWidget);
	        }
	    });
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
