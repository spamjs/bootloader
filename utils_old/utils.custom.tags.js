select_namespace("utils.custom", function(custom){
	
    custom.dom = window.CustomDom = function CustomDom(name,innerHTML) {
        this.name = name;
        this.attrString = '';
        this.classString = '';
        this.innerHTML = innerHTML || '';
    };
    custom.dom.prototype.attr = function(name,value){
    	if(!name) return this;
    	this.attrString += (' ' + ((value!=undefined)? (name+'="'+value + '"') : name)); return this;
    };
    custom.dom.prototype.addClass = function(classname){
    	this.classString += (classname ? (' ' +classname) : ''); return this;
    };
    custom.dom.prototype.toString = function(){
    	return '<'+this.name+  ' class="' + this.classString + 
    	'" ' +this.attrString + '>'+this.innerHTML+'</'+this.name+'>'
    };
    custom.dom.prototype.append = function(innerHTML){
    	this.innerHTML += innerHTML; return this;
    };
    custom.dom.prototype.text =  custom.dom.prototype.html = function(innerHTML){
    	this.innerHTML = innerHTML; return this;
    };
    custom.dom.prototype.empty = function(innerHTML){
    	this.innerHTML=''; return this;
    };
    custom.Tag = function Tag(tagType,fieldType){
    	custom.dom.call(this,'div');
    	this.tagType = tagType;
    	this.fieldType = fieldType || "";
    	this.iVal = "";	this.dVal = "";
    	this.tabIndex = 0; this.iRow = 0; this.iCol =0;
    };
    custom.Tag.prototype = (new custom.dom());
    custom.Tag.prototype.setIndex = function Tag(tabIndex,iRow,iCol){
    	this.tabIndex = tabIndex || (this.tabIndex || 0);
    	this.iRow = iRow || this.iRow;
    	this.iCol = iCol || this.iCol;
    };
    custom.Tag.prototype.setValue = function(iVal,dVal){
    	this.iVal = iVal || this.iVal;
    	this.dVal = dVal || this.dVal;
    };
    custom.Tag.prototype.toString = function(){
    	return '<'+this.name+  ' class="tag ' + this.tagType + ' '  + this.fieldType +' r'+this.iRow +' c'+this.iCol+' '+ this.classString + 
    	'" tagType="' + this.tagType +'"' + ' fieldType="' + this.fieldType +'"' +  '  id="'+this.iRow+'x'+this.iCol+'"' + 
    	' iRow="' + this.iRow +'"' + ' iCol="' + this.iCol +'"' +  ' tabIndex="' + this.tabIndex +'" data-iVal="' + this.iVal + '"' +
    	' ' +this.attrString + (this.singleTag ? ('/>') :  ('>'+this.innerHTML+'</'+this.name+'>'))
    };
	custom.attrs = ['minValue','maxValue','limit','minValueExpr'];
	custom._tag = function(obj){
		var $TAG = new custom.Tag(obj.tagType,obj.fieldType);
		$TAG.addClass(obj.parentDivClass||'')

		if(!obj.attr) obj.attr = {};
		if(!obj.noNavIndex){
			//?????????????????
			$TAG.setIndex(obj.tabIndex,obj.row,obj.col);
		} 
		$TAG.setIndex(obj.tabIndex,obj.row,obj.col)
		
		if(obj.dead){
			$TAG.addClass("dead");
		}
		
		obj._readOnly = "";
		if(obj.readOnly){
			$TAG.attr("readonly=readonly");
			$TAG.addClass('readOnly yes');
			//obj._readOnly = 'readonly=readonly';
			//obj._parentDivClass = obj._parentDivClass + " readOnly yes";
		}
		if(obj.$tagDiv){
			$TAG.attr('tabindex' , obj.tabIndex);
			$TAG.attr('fieldType' , obj.fieldType);
			$TAG.attr('tagType' , obj.tagType);
			obj.$tagDiv.attr({
				'class' : obj._parentDivClass,
				tabindex : obj.tabIndex,
				fieldType : obj.fieldType,
				tagType :  obj.tagType
			});
			var $tagDiv = obj.$tagDiv;
			obj.$tagDiv = null;
			return $tagDiv;
		}
		return $TAG;
		//return $('<div '+$TAG.classString+' tabindex='+obj.tabIndex+' fieldType='+obj.fieldType+' tagType='+obj.tagType+' ></div>');
		//return $('<div class="'+obj._parentDivClass+'" '+ obj._navIndex +' tabindex='+obj.tabIndex+' fieldType='+obj.fieldType+' tagType='+obj.tagType+' ></div>');
	};
	custom._display = function(obj){
		if(obj._display==undefined) obj._display = "";
		if(obj._parentDivClass && obj._parentDivClass.indexOf("placeholder") != -1 && obj._display == "")
			return '<input type="text" value="'+obj._display
			+'" oldVal = "'+obj._display+'" class="display input" '
			+obj._readOnly+' tabindex='+obj.tabIndex+' '+ obj._disAttr+' >'
			+ '<div class="display input">'+obj.attr.placeholder+'</div>';
		else
			return '<input type="text" value="'+obj._display
			+'" oldVal = "'+obj._display+'" class="display input" '
			+obj._readOnly+' tabindex='+obj.tabIndex+' '+ obj._disAttr+' >'
			+ '<div class="display input">'+obj._display+'</div>';
	};
	
	custom._input = function(obj){
		if(!obj._inputClass) obj._inputClass = "value";
		return '<input type="hidden" value="'+obj.value+'" class="'+obj._inputClass+'">';
	};
	custom.checkOnErrorTrigger = function($widget,e){
		//console.debug('dfdf',$widget,e)
		if($widget[0] && $widget[0].onerror) {
			e.$widget = $widget; e.isValidInput = false;
			$widget[0].onerror(e);
		} else if($widget.hasClass('fireOnError')){
			$widget.onChange();
		}
	}
	custom.tag = function(obj){
		var $tag = [];
		if(custom[obj.tagType] && custom[obj.tagType].tag){
			$tag = custom[obj.tagType].tag(obj);
			//$tag.attr("class", obj._parentDivClass);
		} else {
			if(obj.tagType=="checkbox"){
				$tag = custom._tag(obj);
				if(obj.value){
					$tag.addClass("calCheckBox"); obj.value = 1;
				} else { $tag.addClass("checkBoxClear"); obj.value = 0; }
				if(obj.full)$tag.addClass("full");
				$tag.append('<input type="hidden" value="'+obj.value+'" class="toggleValue value">');
			} else if(obj.tagType=="inputbox"){
				$tag = custom._tag(obj);
				if(obj.value===undefined) obj.value = "";
				$tag.append('<input type="text" value="'+obj.value+'" class="display input dn" '+obj._readOnly+' tabindex='+obj.tabIndex+' ><div class="display input">'+obj.value+'</div>');
				$tag.append('<input type="hidden" value="'+obj.value+'" class="value">');
				$tag.setValue(obj.value);
//			} else if(obj.tagType=="dead"){
//				$tag = custom._tag(obj);
//				$tag.text(" ");
			} else if(obj.tagType=="html"){
				$tag = custom._tag(obj);
				$tag.html(obj.value)
			} else {
				obj.tagType = "textlabel";
				$tag = custom._tag(obj);
				obj._display = obj.value;
				var _tVal = obj.value;
				if(obj.formatType){
					if(utils.format.hasMap(obj.formatType)){
						obj.iVal = obj.value;
						var o = utils.format.get(obj.formatType,obj);
						obj._display = o.dVal;
						_tVal =  o.tVal;
					}else{
						obj._display = utils.format.get(obj.formatType,obj._display,obj);
					}
				}
				if(_tVal==undefined) _tVal = obj.value;
				$tag.text(obj._display).attr("title",_tVal);
			}
		}
		for(var i in custom.attrs){
			var attr = custom.attrs[i];
			if(obj[attr]!==undefined) $tag.attr(attr, obj[attr]);
		}
		
		if(obj.attr)
			for(var attr in obj.attr){
				if(obj.attr[attr]) $tag.attr(attr, obj.attr[attr]);
			}
		if(obj.onChange && $tag.onChange){
			 $tag.onChange(obj.onChange);
		}
		if(obj.onClick && $tag.onClick){
			$tag.onClick(obj.onClick);
		}
		if(obj.onerror && false){
			$tag[0].onerror = obj.onerror;
		} else if(obj.fireOnError && obj.onChange){
			$tag[0].onerror = obj.onChange;
		}
		return $tag;
	};
	$.fn.addTag = function(obj){
		return this.append(custom.tag(obj));
	};
	$.fn.tag = function(obj){
		obj.$tagDiv = this;
		return custom.tag(obj);
	};
	$.fn.setTagAttribute = function(attr,value){
		this.attr(attr,value);
		$("input.display",this).attr(attr,value);
	};
	custom.setInputValue = function($this,value,callOnChange){
		var oldVal = $("input.value", $this).val();
		$("input.value", $this).val(value);
		if(callOnChange && (oldVal!=value)){
			$this.onChange();
		}
	};
	custom.setDisplay = function($this,displayVal,tVal, dataVal){
		if(!tVal) var tVal = displayVal;
		$this.attr("title",tVal);
		$("input.display",$this).val(displayVal).attr("oldval",displayVal);
		$("div.display",$this).text(displayVal);
		if(dataVal)	$('input.value',$this).val(dataVal);
	};
	custom.execute = function($widget,e,cb){
		var $block = $widget.parents('.block');
		e.$widget = $widget;
		if($block[0] && $block[0].execute) {
			return $block[0].execute(e);
		} else if(cb){
			return cb(e);
		} else{
			$('input.value',$widget).change();
		}
	};
	
});

select_namespace("utils.custom.css", function(css){
	css.index = 1;
	css.init = function(){
		for(var i=0; i<document.styleSheets.length; i++){
			var sheet = document.styleSheets[i];
			if(sheet.title == 'utils_css') {
				css.sheet = sheet;
			}
		}
		css.$HEAD = $('head');
		if(!css.sheet){
			css.$HEAD.append("<style title='utils_css' type='text/css'></style>");
		}
		if(css.sheet.cssRules && !$.browser.msie){
			css.add_ = css.add_FF;
			css._add = css.FF_add;
		} else {
			css.add_ = css.add_IE;
			css._add = css.IE_add;
		}
	};
	css.add_IE = function(selecter, rule, index){
		css.sheet.addRule(selecter,rule, index);
		return index;
	};
	css.add_FF = function(selecter, rule, index){
		css.sheet.insertRule(selecter + "{"+rule + "}",index);
		return index;
	};
	css.add_ = function(selecter, rule,index){
		// css.init();
		// return css._add(selecter, rule,index);
		$("#dffcss"+index).remove();
		css.$HEAD.append("<style id='dffcss"+index+"' type='text/css'>"+selecter + "{"+rule + "}</style>");	
		return	index;	
	};
	css._add = function(selecter, rule,index){
		css.init();
		return css._add(selecter, rule,index);	
	};
	css.IE_add = function(selecter, rule, index,$SHEET){
		if($SHEET && $SHEET.append){
			$SHEET.append(" "+selecter + "{"+rule + "}");
		} else {
			css.sheet.cssText = css.sheet.cssText + selecter + "{"+rule + "}";	
		}
		return	index;
	};
	css.counter = 0;
	css.FF_add = function(selecter, rule, index,$SHEET){
		if($SHEET && $SHEET.append){
			$SHEET.append(selecter + "{"+rule + "}");
		} else {
			$("#dffcss"+index).remove();
			css.$HEAD.append("<style id='dffcss"+index+"' type='text/css'>"+selecter + "{"+rule + "}</style>");	
		}
		return	index;
	};
	css.add = function(selecter, rule,index,$context){
		if(index===undefined) var index = css.index++;
		return css._add(selecter, rule,index,$context);
	};
});

