utils.custom.defineWidget("toggle").as(function(toggle){
	
	toggle.on(".option", "click", function(e,uE){
		uE.key = utils.is.enter();
		uE.mode = 'select';
		toggle.on_keydown(uE.$widget[0],uE,e);
		return false;
	});	
	toggle.tag = function(obj){
		var $toggle = new utils.custom.Tag('toggle',obj.fieldType);
		$toggle.setIndex(obj.tabIndex, obj.iRow, obj.iCol);
		$toggle.append(toggle.createOptions(obj.options,obj.optionValue || obj.value));
		return $toggle;
	};
	toggle.setValue = function($widget, iVal, validate,trigger, dVal){
		var $opt = $widget.find('.option[data-value="'+iVal+'"]')
		if($opt && $opt.length){
			$('.option',$widget).addClass('dn');
			$opt.removeClass('dn');
			utils.custom.iVal($widget, new utils.format.defMap(iVal ,dVal),trigger);			
		}
	};
	toggle.setOptions = function($widget, params){
		$widget.html(toggle.createOptions(params.options,params.value))
	};
	toggle.createOptions = function(_options,value){
		var optionString = '';
		value = (_options[value]==undefined) ? undefined : value;
		for(var i in _options){
			var hide = 'dn';
			if(!value){ value = i; } if(value==i){hide=''; }
			optionString+=('<div data-display="'+_options[i]+'" data-value="'+i+'" class="option '+hide+'">'+_options[i]+'</div>')
		};
		return optionString;
    };
	toggle.on_keydown = function(elem, uE, e) {
		 if(utils.is.enter(uE.key)){
        	if(uE.mode != 'edit'){
        		var $option = utils.custom.options.toggle($('.option',elem),'option');
        		utils.custom.iVal(uE.$widget, new utils.format.defMap($option.attr('data-value') ,$option.attr('data-value') ));
        	}
		 } 
		 return 'select';
	}
});


utils.custom.defineWidget("checkbox",function(checkbox){
	checkbox.on("click", function(e,uE){
		if(!uE.readOnly){
			uE.key = utils.is.enter();
			uE.mode = 'select';
			checkbox.on_keydown(uE.$widget[0],uE,e);
		} return false;
	});	
	checkbox.tag = function(obj){
		var checkbox = new utils.custom.Tag('checkbox',obj.fieldType);
		checkbox.addClass();
		checkbox.setIndex(obj.tabIndex, obj.iRow, obj.iCol);
		if(obj.checked || obj.checked=='true'){
			checkbox.addClass('calCheckBox');
			checkbox.attr('data-ival',true);
		}else{
			checkbox.addClass('checkBoxClear');
			checkbox.attr('data-ival',false);
		}
		if(obj.label){
			checkbox.append(obj.label);
			checkbox.attr('onselectstart',"return false");
		};
		return checkbox;
	};
	checkbox.on_keydown = function(elem, uE, e) {
		 if(utils.is.enter(uE.key)){
        	if(uE.mode != 'edit'){
        		var el=$(elem),checked= el.hasClass('calCheckBox') ; //el.attr('data-ival');
        		checkbox.setValue(el,!checked,undefined,undefined);
        		/*
        		if(checked==true || checked=='true'){
        			el.removeClass('calCheckBox');el.addClass('checkBoxClear');
        			el.attr('data-ival',false);
        		}else if (checked==false || checked=='false'){
        			el.removeClass('checkBoxClear');el.addClass('calCheckBox');
        			el.attr('data-ival',true);
        		}
        		*/
        	}
		 } 
		 return 'select';
	};
	checkbox.getValue = function($widget,attr,$opt){
		if($widget.hasClass("calCheckBox")) return $widget.hasClass("boolValue") || 1;
		else return ($widget.hasClass("boolValue") ? false : 0);
	};
	checkbox.setValue = function($widget, iVal, validate,trigger, dVal){
		if(iVal==true || iVal=='true'){
			$widget.removeClass('checkBoxClear');$widget.addClass('calCheckBox');
			utils.custom.iVal($widget, new utils.format.defMap('false' ,dVal),trigger);
		}else if (iVal==false || iVal=='false'){
			$widget.removeClass('calCheckBox');$widget.addClass('checkBoxClear');
			utils.custom.iVal($widget, new utils.format.defMap('true' ,dVal),trigger);
		}
					
	};
});
utils.custom.defineWidget("checkboxlist",function(checkboxlist){
	var defaultCheckboxCls='calCheckBox';
	checkboxlist.on('.option',"click", function(e,uE){
		uE.key = utils.is.enter();
		uE.mode = 'select';
		uE.$option = $(this);
		checkboxlist.on_keydown(uE.$widget[0],uE,e);
		return false;
	});	
	checkboxlist.tag = function(obj){
		var tag = new utils.custom.Tag('checkboxlist',obj.fieldType),options=obj.options;
		tag.setIndex(obj.tabIndex, obj.iRow, obj.iCol);
		if(obj.multiselect)
			tag.attr('multiselect',true);
		if(options){
			checkboxlist.createOptionList(tag,options);	
		}
		return tag;
	};
	checkboxlist.on_keydown = function(elem, uE, e) {
		var $target = uE.$option || uE.$this || $(e.target);
		if(utils.is.enter(uE.key)){
			var isMulti = uE.$widget.attr('multiselect');
			var checked = $target.hasClass(defaultCheckboxCls);
			$options =$('.option',uE.$widget);
			if(!isMulti){
				$options.removeClass(defaultCheckboxCls)
			}
			$target[checked ? 'removeClass' : 'addClass'](defaultCheckboxCls);
			var iVal = checkboxlist._getValue(uE.$widget,undefined,$options);
			utils.custom.iVal(uE.$widget, new utils.format.defMap(iVal+'',''),true);
		}
		return 'select';
	};
	checkboxlist.getValue = function($widget,attr,$opt){
		return $widget.attr('data-ival').split(',');
	};
	checkboxlist._getValue = function($widget,attr,$opt){
		var $opt = $opt ||  $('.option',$widget);
		var iVal = [];
		$opt.each(function(i,elem){
			if($(elem).hasClass(defaultCheckboxCls))
				iVal.push($(elem).attr('key')) 
		})
		return iVal;
	};
	
	checkboxlist.setValue = function($widget, iVal, validate,trigger, dVal){
		var $opt =$('.option',$widget);
		var fVal=[];
		$opt.each(function(i,elem){
			$(elem).removeClass(defaultCheckboxCls);
		})
		if(typeof(iVal) == 'string'){
			checkboxlist.checker($opt,fVal,iVal);
		}else if(iVal instanceof Array){
			$.each(iVal, function(i){
			    if(typeof(iVal[i]) == 'string') {
			    	checkboxlist.checker($opt,fVal,iVal[i]);
			    }else if(iVal[i].key){
			    	checkboxlist.checker($opt,fVal,iVal[i].key,iVal[i].checked,iVal[i].label);
			    }
			});
		}else {
			for(i in iVal){
				checkboxlist.checker($opt,fVal,i,iVal[i]);
			}
		}
		utils.custom.iVal($widget, new utils.format.defMap(fVal.toString() ,dVal),trigger);
	};
	checkboxlist.checker=function($opt,fVal,cond1,cond2,label){
		if(cond2!=undefined){
			$opt.each(function(i,elem){
				if($(elem).attr('key')==cond1){
					if(label)$(elem).html(label);
					if(cond2==true){
						$(elem).addClass(defaultCheckboxCls);
						fVal.push(cond1);
					}
				} 
			})
		}else{
			$opt.each(function(i,elem){
				if($(elem).attr('key')==cond1){
					$(elem).addClass(defaultCheckboxCls);
					fVal.push(cond1);
				} 
			})	
		}
		
	};
	checkboxlist.createOptionList=function(tag,options){
		var strOptions='',i=0,_tabIndex = tag.tabIndex+'.',iVal=[];
		if(options instanceof Array){
			for (i in options){
				strOptions+=checkboxlist.createOption(options[i],_tabIndex+(i++),iVal);
			}	
		}else if(options instanceof Object){
			for (i in options){
				var opt={key:i,checked:options[i],label:''};
				strOptions+=checkboxlist.createOption(opt,_tabIndex+(i++),iVal);
			}
		}
		tag.append(strOptions);
		tag.attr('data-ival',iVal.toString());
	};
	checkboxlist.createOption=function(option,tabindex,iVal){
		if(option.checked==true){
			iVal.push(option.key);
			return '<div tabindex='+tabindex+' class="option '+defaultCheckboxCls+'" key="'+option.key+'">'+(option.label||'')+'</div>';
		}else{
			return '<div tabindex='+tabindex+' class="option" key="'+option.key+'">'+(option.label||'')+'</div>';
		}
	};
	checkboxlist.checkOption=function(key){
		var tag=$(this);
		if(!tag.hasClass('checkboxlist'))
			return false;
		var isMulti=tag.attr('multiselect');
		isMulti=(isMulti==true||isMulti=="true");
		var found=false;
		var oldVal=tag.attr('data-ival');
		$('.option',tag).each(function(i,elem){
			if(isMulti){
				if($(elem).attr('key')==key && !$(elem).hasClass(defaultCheckboxCls)){
					$(elem).addClass(defaultCheckboxCls);
					var iVal=tag.attr('data-ival');
					iVal+=','+key;
					tag.attr('data-ival',iVal);
				}
			}else{
				if($(elem).attr('key')==key && !$(elem).hasClass(defaultCheckboxCls)){
					$(elem).addClass(defaultCheckboxCls);
					tag.attr('data-ival',key);
					found=true;
				}else
					$(elem).removeClass(defaultCheckboxCls);
			}	 
		});
		if(!found){
			$(".option[key='"+oldVal+"']",tag).addClass(defaultCheckboxCls);
		}
		return this;
	};
	checkboxlist.unCheckOption=function(key){
		var tag=$(this);
		if(!tag.hasClass('checkboxlist'))
			return false;
		$('.option',tag).each(function(i,elem){
			if($(elem).attr('key')==key && $(elem).hasClass(defaultCheckboxCls)){
				$(elem).removeClass(defaultCheckboxCls);
				var iVal=tag.attr('data-ival');
				iVal=iVal.split(',')
				$.each(iVal, function(i){
				    if(iVal[i]=== key) {
				    	iVal.splice(i,1);
				        return false;
				    }
				});
				tag.attr('data-ival',iVal.toString());
			}	 
		});
		return this;
	};
	checkboxlist.init=function(){
		$.fn.checkOption=checkboxlist.checkOption;
		$.fn.unCheckOption=checkboxlist.unCheckOption;
	};
});
