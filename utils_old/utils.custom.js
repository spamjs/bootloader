select_namespace("utils.custom", function(custom){
    window.$C = custom;
    custom.keys = { 8: "backspace", 9: "tab", 13: "enter", 16: "shift", 17: "ctrl", 18: "alt", 19: "pause",
    		20: "capslock", 27: "esc", 32: "space", 33: "pageup", 34: "pagedown", 35: "end", 36: "home",
    		37: "left", 38: "up", 39: "right", 40: "down", 45: "insert", 46: "del", 
    		96: "0", 97: "1", 98: "2", 99: "3", 100: "4", 101: "5", 102: "6", 103: "7",
    		104: "8", 105: "9", 106: "*", 107: "+", 109: "-", 110: ".", 111 : "/", 
    		112: "f1", 113: "f2", 114: "f3", 115: "f4", 116: "f5", 117: "f6", 118: "f7", 119: "f8", 
    		120: "f9", 121: "f10", 122: "f11", 123: "f12", 144: "numlock", 145: "scroll", 191: "/", 224: "meta"	};
    
	custom.readyEventQ = utils.queue(function(cb){
		cb();
	});
	custom.readyEventQ.blocked = true;
	
    custom.event = function uEvent(name, $widget, props) {
        this.name = name;
        this.$widget = $widget;
        this.stopped = false;
        this.navigate = true;
        this.props = props || {};
    };
    custom.event.prototype.set = function(key,value){
        this[key] = value; return this; 
    };
    custom.event.prototype.stop = function(e){
    	this.navigate = false;  this.stopped = true;
    	if(e) utils.preventPropagation(e);
    	console.log('event stoppped...');
    	//console.trace()
    };
    $.fn.EXEC = function(fName, e, defValue) {
        var tagType = this.attr('tagType');
        return custom.EXEC(tagType, fName, e, defValue);
    };
    custom.DEF = function(e,defValue) {
        return defValue;
    };
    custom.EXEC = function(tagType, fName, e, defValue) {
        if (tagType && fName && custom[tagType] && custom[tagType][fName])
            return custom[tagType][fName];
        return custom.DEF;
    };
    /**
     * @param $widget - widget, values if being changed for.
     * @param oMap - format 
     * @param preventPropagationOrForce - if not passed then onchange is triggered based on value, 
     * 			if true then onchange is triggered forcefully,if false then onchange is prevented 
     */
    custom.iVal = function($widget, oMap, preventPropagationOrForce,uE) {
        if (!$widget[0]) return false;
        var oldVal = $widget[0].getAttribute('data-ival') || '';
        var ev = (uE ? uE.set('name', 'change').set('props',oMap) : new custom.event('change', $widget, oMap));
        ev.oldVal = oldVal;
        ev.isValid = oMap.isValid;
        $widget[0].setAttribute('data-ival', oMap.iVal);
        var changed = (oldVal != oMap.iVal);
        if ((preventPropagationOrForce===undefined && changed) || (preventPropagationOrForce===true)) {
        	ev.mode = $widget[0].getAttribute('mode');
        	ev.tagType = $widget[0].getAttribute('tagType');
        	ev.fieldType = $widget[0].getAttribute('fieldType');
        	ev.iRow = $widget[0].getAttribute("iRow");
        	ev.iCol = $widget[0].getAttribute("iCol");
        	try{
        		$widget.trigger("_onchange_", ev, oMap);
        	} catch(ex){
        		console.error(ex)
        	}
        }
        return changed;
    };
    custom._onchange_ = function($block, cb, onerror) {
        if (false && $block.hasClass('block') && cb) {
            return $block.on("div.tag", "_onchange_", cb);
        } else {
            if (onerror)
                $block.attr('onerror', true)
            return $block.on("_onchange_", cb);
        }
    };
    custom.attrList = ['tagType', 'fieldType', 'formatType', 'onerror'];
    custom.defineWidget = function(name, cb) {
    	var wSpace = utils.selectObject(this, name);
        wSpace['super'] = wSpace['super'] || {};
        wSpace.widgetName = name;
        wSpace.on = function(_selector, _eventName, _cb) {
        	var subSelec = "";
        	var selector = _selector,eventName = _eventName,cb = _cb; 
        	if(cb==undefined && typeof(eventName)=='function'){
        		cb = _eventName;  eventName = _selector;
        		custom.readyEventQ.put(function(e){
        			return $("body").on(eventName,"div.tag." + this.widgetName + subSelec, function(e,e2,e3,e4,e5){
        				var $widget = $(this)
        				e.uE = new utils.custom.event(e.type,$widget);
        				e.uE.$this = $widget;
        				e.uE.mode = $widget.attr('mode');
        				e.uE.tagType = $widget.attr('tagType');
        				e.uE.fieldType = $widget.attr('fieldType');
        				e.uE.isDisable = $widget.hasClass('disabled');
        				e.uE.readOnly = e.uE.isDisable || $widget.hasClass('readOnly');
        				return cb.call(this,e,e.uE,e2,e3,e4,e5);
        			});
        		}.bind(this));
        	} else{ 
	        	subSelec = " " + selector;
	    		custom.readyEventQ.put(function(e){
	    			return $("body").on(eventName,"div.tag." + this.widgetName + subSelec, function(e,e2,e3,e4,e5){
	    				var $this = $(this)
	    				var $widget = $this.parents(".tag:eq(0)");
	    				e.uE = new utils.custom.event(e.type,$widget);
	    				e.uE.$this = $this;
	    				e.uE.mode = $widget.attr('mode');
	    				e.uE.tagType = $widget.attr('tagType');
	    				e.uE.fieldType = $widget.attr('fieldType');
	    				e.uE.isDisable = $widget.hasClass('disabled');
	    				e.uE.readOnly = e.uE.isDisable || $widget.hasClass('readOnly');
	    				return cb.call(this,e,e.uE,e2,e3,e4,e5);
	    			});
	    		}.bind(this))
    		}
        };
        wSpace.attrList = custom.attrList;
        wSpace.extendAttrs = function(args) {
            this.attrList = this.attrList.concat(args);
        };
        wSpace.getAttributes = function($widget) {
            var aMap = {};
            for (var i in this.attrList) {
                aMap[this.attrList[i]] = $widget.attr(this.attrList[i]);
            }
            return aMap;
        };
        wSpace.setAttributes = function($widget, aMap) {
            for (var i in this.attrList) {
                if (aMap[this.attrList[i]] != undefined)
                    $widget.attr(this.attrList[i], aMap[this.attrList[i]])
            }
            return $widget;
        };
        wSpace.defns = [];
        wSpace.as = function(_cb){
        	this.defns.push(_cb);
        	_cb(wSpace); return this;
        };
        wSpace.from = function(_name){
        	var _fromWSpace = utils.selectObject(custom, _name);
        	for(var i in _fromWSpace.defns){
        		this.defns.push(_fromWSpace.defns[i]);
        		_fromWSpace.defns[i](this)
        	}
        	return this;
        };
        wSpace.override = function(fname,fn){
        	if(this[fname]) this['super'][fname] = this[fname].bind(this);
        	else console.log('super function does not exist');
        	this[fname] = fn;
        	return this;
        };
        
        if (this.extended)
            this.extended(wSpace)
        if (cb) wSpace.as(cb);
        return wSpace;
    };
    custom.extended;
    custom.defineWidget.extend = function(_cb) {
        var oldE = custom.extended;
        custom.extended = function(_arg) {
            if (oldE)
                old(_arg)
            if (_cb)
                _cb(_arg)
        }
    };
    custom.on = function(selector, eventName, cb) {
    	return utils.custom.readyEventQ.put(function(){
    		return $("body").on(eventName,selector, function(a,b,c,d,e){
            	return cb.call(this,a,b,c,d,e);
            });
    	})
    };
    
    custom.triggerEvent = function(element) {
        var event; // The custom event that will be created
        if (document.createEvent) {
            event = document.createEvent("HTMLEvents");
            event.initEvent("change", true, true);
        } else {
            event = document.createEventObject();
            event.eventType = "change";
        }
        event.eventName = "change";
        if (document.createEvent) {
            element.dispatchEvent(event);
        } else {
            element.fireEvent("onchange", event);
        }
        // $(element).trigger(event,{x : 'A'})
    };
    
    $.fn.setRoundValue = function(round) {
        this.addClass("round");
        this.attr("round", round)
        $("input.display", this).attr("round", round);
    };

    //EVENTS BASED
    utils.is = function(is){
    	is.arrow = function(key){
    		return (key < 41 && key > 36);
    	};
    	is.nav = function(key){
    		return this.arrow(key) || (key==9) || (key==13);
    	};
    	for(var key in custom.keys){
    		is[custom.keys[key]] = new Function('key','return (key ?(key=='+key+'):'+key+")")
    	}
    	return is;
    }({})
    utils.navKeys = [37, 38, 39, 40, 9, 13];
    utils.isArrowKey = function(key) {
        return (key < 41 && key > 36)
    };
    utils.isNavKey = function(key, shiftCheck) {
        return ($.inArray(key, utils.navKeys) !== -1) || (shiftCheck != undefined && key == 16);
    };
    utils.isNumKey = function(key, e) {
        return  key == 17 || key == 18 || (47 < key && key < 58 && (!e || e.shiftKey == false))
                || (95 < key && key < 106) || (key == 8) || (key == 9)
                || (key > 34 && key < 40) || (key == 46)
    };
    utils.fireEvent = function(name, data) {
        var e = document.createEvent("Event");
        e.initEvent(name, true, true);
        e.data = data;
        window.dispatchEvent(e);
    };
    utils.preventPropagation = function(event) {
        if (!event)
            var event = window.event;
        if (event) {
            if (event.preventDefault) {
                event.preventDefault();
                event.cancelBubble = true;
                event.returnValue = false;
                event.stopPropagation && event.stopPropagation();
                event.stopImmediatePropagation && event.stopImmediatePropagation();
            } else {
                event.cancelBubble = true;
                event.returnValue = false;
                event.stopPropagation && event.stopPropagation();
                event.stopImmediatePropagation && event.stopImmediatePropagation();
                return false;
            }
        }
    };

    if ('querySelector' in document){
        $.getFirst= function(selector,$c) { 
            if($c){
            	if($c[0]) return $($c[0].querySelector(selector))
            	return $();
            } return $(document.querySelector(selector))
        }
    } else {
        $.getFirst= function(selector,$c) {  
            return $(selector,$c).first();
        }
    }
    
    utils.custom.oldAttr = $.fn.attr;
    return;
    $.fn.attr = function() {
        var a, aLength, attributes, map;
        if (this[0] && arguments.length === 0) {
            map = {};
            attributes = this[0].attributes;
            aLength = attributes.length;
            for (a = 0; a < aLength; a++) {
                map[attributes[a].name.toLowerCase()] = attributes[a].value;
            }
            return map;
        } else {
            return utils.custom.oldAttr.apply(this, arguments);
        }
    }
});


select_namespace("utils.custom.options", function(options){
	
	options.toggle = function($elem,filterClass,className,add){
		var add  = add || false;  var className  = className || "dn";
		var curSelector  = ((filterClass==undefined) ? "" : ('.'+filterClass))
							+(add? ("."+className) : (":not(."+className+")")); 
		var $curOption = $elem.filter(curSelector);
		var $nextOption = $curOption.next();
		if(!$nextOption.length || !$nextOption.hasClass(filterClass)) $nextOption = $elem.filter("."+filterClass+":eq(0)");
		if(!add){
			$elem.addClass(className);
			$nextOption.removeClass(className)
		} else {
			$elem.removeClass(className);
			$nextOption.addClass(className)
		}
		return $nextOption;
    };
    
	$.fn.toggleOption = function(filterClass,className,add){
		return options.toggleOption(this,filterClass,className,add);
	};
	
});

$.fn.setValue = function(iVal,attr,trigger, _dVal){
	return this.each(function(index,elem){
		var $widget = $(elem);
		var tagType = $widget.attr('tagType');
		if(tagType){
			if(utils.custom[tagType] && utils.custom[tagType].setValue){
				utils.custom[tagType].setValue($widget,iVal,true,!!trigger,_dVal)
			} else utils.custom.iVal($widget, new utils.format.defMap(iVal ,_dVal),!!trigger);
		} else {
			var formatType = $widget.attr('formatType');
			var dVal = iVal,tVal=iVal;
			if(formatType){
				var val= utils.format.get(formatType,{
					dVal : iVal,
					limit : $widget.attr("limit")
				});
				dVal = val.dVal;
				tVal = val.tVal;
			}
			if(elem.tagName==='INPUT' || elem.tagName==='SELECT' ){
				elem.value = dVal;
			} else {
				elem.innerHTML = dVal;
			}
			elem.title = tVal;
		}
	});
};

$.fn.getValue = function(attr, islist){
	var $this = $(this);
	if($this.prop("tagName")=='INPUT'){
		var iVal = $this.val();
		var formatType= $this.attr('formatType');
		if(formatType){
			iVal = utils.format.get(formatType,{
				dVal : iVal
			}).iVal;
		}
		return iVal;
	}
	var tagType = $this.attr('tagType');
	if( tagType &&  utils.custom[tagType] && utils.custom[tagType].getValue){
		return utils.custom[tagType].getValue(this,attr);
	} else if($this.hasClass("multiselect")){
		return utils.custom.multiselect.getValue(this,attr, islist);
	} else if($this.hasClass("tokeninput")){
		var vals = $("input.input",$this).tokenInput("get");
		var rVals = {};
		if(islist){
			rVals = []
			for(var i in  vals){
				rVals.push(vals[i].id);
			}
		} else {
			for(var i in  vals){
				rVals[vals[i].id] =vals[i].name;
			}
		}
		return rVals;
	}else if($this.hasClass("checkboxlist")){
		return utils.custom.checkboxlist.getValue(this,attr);
	} else {
		return $this.attr('data-ival')
	}
	if(attr==undefined)
		return $("input.value", $this).val();
	else return $("input.value", $this).attr(attr);
};

$.fn.setParams = function(params){
	var $this = $(this);
	var first;
	if(!params.options && params.possibleOptions)
		params.options = params.possibleOptions;

	if(params.value==undefined){
		params.value = this.getValue();
		params.display = params.options[params.value];
		if(params.display===undefined) { params.display =""; params.value==undefined;}
	}
	var tagType = $this.attr('tagType');
	if(tagType){
		if(utils.custom[tagType] && utils.custom[tagType].setParams){
			utils.custom[tagType].setParams(this,params)
		} else if(utils.custom[tagType] && utils.custom[tagType].setOptions){
				utils.custom[tagType].setOptions(this,params)
		} else {
			
		}
	}
	return;
	
	if($this.hasClass("tabstrip") || $this.hasClass("radiostrip")){
		return utils.custom.selection.setParams(this,params);
	} else if($this.hasClass("stripbar")){
		return utils.custom.stripbar.setParams(this,params);
	} else if($this.hasClass("droption")){
		return utils.custom.dropdown.setParams(this,params);
	} 
	else if($this.hasClass("toggle") || $this.hasClass("amount_toggle")){
		return utils.custom.toggle.setParams(this,params);
	}
	else if($this.hasClass("amount")){
		var j = 0;
		for(var i in params.options){
			$(".option:eq("+j+")",$this).attr('data-value',params.options[i]).text(params.options[i]);
			if(j==0) $(".amount_toggle input._cur",$this).val(params.options[i]);
			j++;
		}
		if(params._cur)
			this.setValue(params.value);
	} 
	this.setDisplay(params.display);
	this.setValue(params.value);
};
///////////////////////JQUERY EXTENSION
$.fn.setDisplay = function(displayVal,tVal, dataVal){
	var $widget = $(this);
	utils.custom.setDisplay($widget,displayVal,tVal, dataVal);
};
var $Cwindow = $(window);
$.fn.isScrolledIntoView = function(){
	var elem = this; var $elem = $(elem);
    var docViewTop = $Cwindow.scrollTop();
    var docViewBottom = docViewTop + $Cwindow.height();
    var elemTop = $elem.offset().top;
    var elemBottom = elemTop + $elem.height();
    return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
};
function parseEvent(e,$this){
	return "eCLASS(" + $(document.activeElement).attr("class") + ") KEY("+(e.keyCode || e.which)+"])"
			+ "EVENT(" + e.type + ")";
}
$.fn.checkPlaceHolder = function(){
	var dispVal = $("input.display",this).val();
	if(dispVal===""){
		var ph = this.attr("placeholder");
		if(ph){
			dispVal = ph;
			this.addClass("lighttext");
		} else {
			dispVal = this.getCustomDataDisplay();
		}
	} else this.removeClass("lighttext");
	return dispVal;
};

$.fn.getCustomDataDisplay = function(value){
	var dataDisplay = "";
	if(value==undefined) var value = $("input.value",this).val();
	var dataVal = this.attr("data-"+value);
	if(dataVal!==undefined){
		return  dataVal;
	} return "";
}

$.fn.getDisplay = function(){
	var $this = $(this);
	if($this.hasClass("toggle")){
	 return $(".option:not(.dn)",$this).text();
	} else 	if($this.hasClass("amount")){
	 return $("input.display", $this).val() +" "+ $(".amount_toggle .option:not(.dn)",$this).text();
	} else if($this.hasClass("stripbar")){
		var value = $this.getValue();
		var $elem = $(".optionValue[data-value='" + value + "']", $this).parents(".striprow");
		return $(".stripelemname span", $elem).text();
	}
	return $("input.display", $this).val();
};

$.fn.setVal = function(_value,attr,callOnChange){
	this.setValue(_value,attr,callOnChange);
	return this;
}
$.fn.addOption = function(dVal, dDisp, shortcut, crossSign){
	var $widgets = $(this);
	if($widgets == undefined) return;
	if(!dVal) return;
	if(!dDisp)	dDisp = dVal;
	if(!shortcut)	shortcut = dDisp.toUpperCase();
	$widgets.each(function(index, element){
		var $this = $(element);
		if($this.hasClass("dropdown")){
			value = utils.custom.dropdown.addOption($this,{dVal : dVal, dDisp : dDisp, shortcut : shortcut, crossSign : crossSign});
		}
	});
}
$.fn.removeOption = function(dVal){
	var $widgets = $(this);
	if($widgets == undefined) return;
	if(!dVal) return;
	$widgets.each(function(index, element){
		var $this = $(element);
		if($this.hasClass("dropdown")){
			utils.custom.dropdown.removeOption($this,{dVal : dVal});
		}
	});
}

$.fn.setSlimScroll = function(options){
	var $this = $(this);
	var tagtype = $this.attr("tagtype");
	if(utils.custom[tagtype] && utils.custom[tagtype].setSlimScroll)
		utils.custom[tagtype].setSlimScroll($this,options);
}
$.fn.getParams = function(){
	var $this = $(this);
	var options = {};
	var opt = {};
	if($this.hasClass("instance_menu_item")){
		return {
			title : $(".title a",$this).text()
		};
	};
	if($this.hasClass("dropdown")){
		$('.dropdown_menu .option',$this).each(function(i,elem){
			var _val = $(elem).attr('data-value');
			opt[_val] = {
					display : $(elem).attr('data-display'),
					value : _val, shortcut : $(elem).attr('shortcut')
			}
			options[_val] = opt[_val].display;
		})
		var val = $("input.value", $this).val();
		if(opt[val])	var display = opt[val].display;
		else 	var display =  $(".display.input", $this).val();
		if(opt[val])	var shortcut = opt[val].shortcut;
		else var shortcut = display.toUpperCase();
		return {
			'data-value' : val,
			'data-display' :$("input.display", $this).val(),
			'display' : display,
			'shortcut' : shortcut,
			'value' : val,
			options : options,
			opt : opt
		};
	};
	if($this.hasClass("amount_toggle"))
		return $("input._cur", $this).val();
	if($this.hasClass("date"))
		return $("input.value", $this).val()-0;
	return $("input.value", $this).val();
};
$.fn.noFunction = function(){};
$.fn.curVal = null;
$.fn.oldVal = null;
$.fn.on_enter = function(callback){
    ENTER_KEY = 13;
    return this.keypress(function(e){
        var key = e.charCode || e.keyCode || 0;
        if (key != ENTER_KEY) return;
        var msg = $(this).val();
        if (msg == "") return;
        if(!callback(msg));
            $(this).val("");
        return false;
    });
};
$.fn.onKeyPress = function(cb){
	var $widget = $(this);
	if(cb==undefined){
		$widget.keypress();
	} else if(typeof(cb)=="function"){
	    $widget.keypress(function(e){
	    	var $widgetDiv = $(this); //.parents(".tag");
	    	var key = (e.keyCode || e.which);
	    	if(key!=9){
	    		e.$widget = $widgetDiv;
		    	e.customKeyCode = key;
		    	e.customKeyName = utils.custom.hotkeys.charForCode(key);
		        if(key && cb) cb(e, $widgetDiv);
	    	}
	    });
	    $widget.keydown(function(e){
	    	var $widgetDiv = $(this); //.parents(".tag");
	    	var key = (e.keyCode || e.which);
	    	if(key==9){
	    		e.$widget = $widgetDiv;
		    	e.customKeyCode = key;
		    	e.customKeyName = utils.custom.hotkeys.charForCode(key);
		        if(key && cb) cb(e, $widgetDiv);
	    	}
	    });
	}
};
$.fn.onClick = function(cb){
	if(!this) return false;
	var $widget = $(this);
	if(cb==undefined){
		if($widget.hasClass("tag")){
			if($widget.hasClass("button"))
				return $widget.change();
			else if($widget.hasClass("arrowtoggle"))
				return $(".dropdownAerrow",$widget).click();
		}
		return false;
	}
	if($widget.hasClass("tag")){
		if($widget.hasClass("button"))
		    return this.change(function(e){
		    	e.$widget = $(this);
		        if(cb) cb(e,e.$widget);
		    });
		else if($widget.hasClass("arrowtoggle"))
		    return $(".dropdownArrow",$widget).click(function(e){
		    	e.$widget = $(this).parents(".tag");
		    	e.$arrow = $(this);
		        if(cb) cb(e,e.$widget);
		    });
		else return this.click(cb);
	}
    return this.click(cb);
};

$.fn.onChange = function(cb,onerror){
	var $widget = $(this);
	var tagType = $widget.attr('tagType');
	if(utils.custom[tagType] && utils.custom[tagType].onChange){
		return utils.custom[tagType].onChange(this,cb);
	} else if($widget.hasClass("amount_toggle")){
		return utils.custom.toggle.onChange(this,cb);
	} else if($widget.hasClass("tabstrip") || $(this).hasClass("radiostrip")){
		return utils.custom.selection.onChange(this,cb);
	} else if(cb) return utils.custom._onchange_($widget,cb,onerror);
	
	if(cb==undefined){
		if($widget.hasClass("droption")){
			return utils.custom.execute($widget, {});
		}
		else if($widget.hasClass("tokeninput")){
			return utils.custom.execute($widget, {},function(e){
				$("input.input", e.$widget).change();
			});
		} else if($widget.hasClass('block')){
			if($widget[0] && $widget[0].execute) {
				var $block = $widget.parents('.block');
				return $widget[0].execute($block, $widget, e);
			}
		}
		return this.blur();
	} else {
		if($widget.hasClass("droption")){
		    return $("input.value", $widget).change(function(e){
		    	var $widgetDiv = $(this).parents(".tag");
		    	var $this = $(this);
		        if(cb && $widgetDiv.isValid()){
		        	e.$widget = $widgetDiv;
		        	cb(e, $widgetDiv);
		        }
		    });
		} else if($widget.hasClass("tokeninput")){
		    return $("input.value", $widget).change(function(e){
		    	var $widgetDiv = $(this).parents(".tag.tokeninput");
		    	var $this = $(this);
		        if(cb){
		        	e.$widget = $widgetDiv;
		        	cb(e, $widgetDiv);
		        }
		    });
		} else if($widget.hasClass('block')){
			if($widget[0]) 
				return $widget[0].execute = cb;
		}
	    return this.blur(function(e){
	    	var $this = $(this);
	    	$this.oldVal = $this.attr("old-value");
	    	$this.curVal = $this.getValue();
	        if(($this.curVal!=$this.oldVal) && cb && $this.isValid()){
	        	e.$widget = $this;
	        	cb(e,$this);
	        }
	        $this.attr("old-value", $this.curVal);
	    });
	}
};

$.fn.setReadOnly = function(_set){
	var $this = this;
	var set = (_set==undefined) ? true : _set;
	if(this[0] && this[0].nodeName == 'INPUT'){
		if(set) $this.attr("readonly", "readonly").attr('disabled' , 'disabled');
		else $this.removeAttr("readonly").removeAttr('disabled');
	} else {
		$this.addClass("readOnly");
		if(set){
			$this.addClass("yes").removeClass("no");
			$(".input", $this).attr("readonly", "readonly");
			if($this.hasClass("tokeninput")){
				$(".token-input-list-facebook",$this).addClass("dn");
				$(".readOnlyDiv",$this).removeClass("dn");
			}else if($this.hasClass("toggleinput")){
				$this.parents(".tagwrapper").addClass("readOnly yes");
			}
		} else {
			$this.addClass("no").removeClass("yes readOnly");
			$(".input", $this).removeAttr("readonly");
			if($this.hasClass("tokeninput")){
				$(".token-input-list-facebook",$this).removeClass("dn");
				$(".readOnlyDiv",$this).addClass("dn");
			}else if($this.hasClass("toggleinput")){
				$this.parents(".tagwrapper").removeClass("readOnly yes");
			}
		}
	}
	//return this;
};

$.fn.popup = function(popup){
	popup.$div = $(this).clone();
	$(popup.$parentDiv).append(popup.$div);	
	if(popup.$overlayDiv && popup.$overlayDiv.length){
		popup.$overlay = popup.$overlayDiv.clone();
		$(popup.$parentDiv).append(popup.$overlay);
	}
	if(popup.left) popup.$div.css("left",popup.left);
	if(popup.top)  popup.$div.css("top",popup.top);
	popup.remove = function(){
		popup.$div.remove();
		if(popup.$overlay) popup.$overlay.remove();
		return null;
	};
	return popup;
};	

window.$widget = null;
window.$app = {};
window.utils.instance_menu = { click : function(){} };
window.utils.instance_menu_item = { click : function(){}, close: function(){}};
window.utils.instance_link = { click : function(){}, close: function(){}};
window.onload = function(){
	
	$("body").delegate("input[formatType]", "change", function(e){
		var $this = $(this);
		var iVal = $this.val();
		var formatType= $this.attr('formatType');
		var dVal = iVal;
		if(formatType){
			var valObj = utils.format.get(formatType,{
				dVal : iVal,
				limit : $this.attr('limit')
			})
			iVal = valObj.iVal;
			dVal = valObj.dVal;
			if(!valObj.isValid){
				$this.setInvalid("ui.invalidInput");
			}else{
				$this.setInvalid("");
			}
		}
		$this.val(dVal);
		return iVal;
	});
	
	$("body").delegate(".actionclick.tag", "click", function(e){
		var $this = $(this);
		if(utils.actionOnClick) utils.actionOnClick($this,this);
	});
	
	$("body").delegate("input.tag.button, a.tag.clickable", "click", function(e){
		var $this = $(this);
		if($this && $this.length && $this.onClick){
			return $this.onClick();
		}
	});
//	$("body").delegate(".tag.enterOption .option", "keydown", function(e){
//		return $(this).onClick();
//	});
//	if($curField.hasClass("enterOption")){
//		$(".option:focus",$curField).click();
//		return;
//	 }
	$("body").delegate(".instance_menu.tag", "click", function(){
		var $this = $(this);
		window.utils.instance_menu.click({
			'sys' : $this.attr("sys"),
			'app' : $this.attr("app"),
			'title' : $("a.title", $this).text()
		});
	});
	$("body").delegate(".instance_link.tag", "click", function(){
		var $this = $(this);
		window.utils.instance_link.click({
			'sys' : $this.attr("sys"),
			'app' : $this.attr("app"),
			'page' : $this.attr("page"),
			'title' : $(".title a", $this).text(),
			'focus' : $this.attr("focus"),
			'highLight' : $this.attr("highLight")
		});
	});
	$("body").delegate(".instance_menu_item.tag .title", "click", function(){
		var $this = $(this).parent();
		$(".instance_menu_item.tag").removeClass("open");
		$this.addClass("open");
		window.utils.instance_menu_item.click({
			'nid' : $this.attr("node-id"),
			'title' : $(".title a", $this).text()
		});
	});
	$("body").delegate(".instance_menu_item.tag .close", "click", function(){
		var $this = $(this).parent();
		window.utils.instance_menu_item.close({
			'nid' : $this.attr("node-id"),
			'title' : $(".title a", $this).text()
		});
	});
	$("body").delegate(".tag.readOnly.yes", "focus", function(){
		$(".input", $(this)).attr("readonly", "readonly");
    });	
	$("body").delegate(".tag.readOnly.no", "focus", function(){
		$(".input", $(this)).removeAttr("readonly");
    });	
	
	for(var widget in utils.custom){
		if(utils.custom[widget].init) utils.custom[widget].init();
	}
	
	utils.custom.readyEventQ.executeStart();
	utils.custom.readyEventQ.blocked = false;
	if(utils.HTMLDONE && utils.custom.beforeonload) utils.custom.beforeonload();
	if(utils.HTMLDONE && utils.custom.onload) utils.custom.onload();
	if(utils.HTMLDONE && utils.custom.afteronload) utils.custom.afteronload();
};
utils.custom.ready = $(document).ready;
/*
select_namespace("utils.custom.checkbox", function(checkbox){
	checkbox.init = function(){
		//CHEKBOXs
		$("body").delegate(".tag.checkbox:not(.readOnly.yes)", "click", function(e){
			var $this = $(this);
			$this.checkboxChange(e);
			return;
	    });	
		$("body").delegate(".tag.checkbox:not(.readOnly.yes)", "keydown", function(e){
			var $this = $(this);
			var key = (e.keyCode || e.which);
			if(key==13){
				$this.checkboxChange(e);
				preventPropagation(e);
			} return;
		});
	};
	checkbox.onChange = function(elem, cb){
		var $widgetDiv = $(elem);
		if(cb==undefined){
			return $("input.toggleValue", $widgetDiv).change();
		}
		$widgetDiv.addClass("onchange");
	    return $("input.toggleValue", $widgetDiv).change(function(e){
	    	var $thisWidget = $(this).parent(".tag");
	    	if($thisWidget.hasClass("readOnly") && $thisWidget.hasClass("yes")) return;
	        if(cb && $thisWidget.isValid()){
	        	e.$widget = $thisWidget;
	        	cb(e,$thisWidget);
	        }
	        //preventPropagation(e);
	    });	
	};
	checkbox.setValue = function($this,value){
		if(value-0 || value=='true' || value===true){ 
			$this.removeClass("checkBoxClear").addClass("calCheckBox");
			$("input[type='checkbox']", $this).attr("checked", true);
		}
		else {
			$this.removeClass("calCheckBox").addClass("checkBoxClear");
			$("input[type='checkbox']", $this).attr("checked", false);
		}
		return value;
	};
	$.fn.checkboxChange = function(e, cb){
		var $this = this;
		var value = 0;
        if ($this.hasClass("calCheckBox")){
        	$this.removeClass("calCheckBox");
        	$this.addClass("checkBoxClear");
        } else {
        	$this.removeClass("checkBoxClear");
        	$this.addClass("calCheckBox");
        	value = 1;
        }
		$("input.toggleValue", $this).val(value);
		e.$widget = $this;
		utils.custom.execute($this, e, function(_e){
			return $("input.toggleValue", _e.$widget).change();
		});
		if(cb) cb(e);
		//preventPropagation(e);
	};
});
*/

select_namespace("utils.custom.checkboxlist", function(checkboxlist){
	checkboxlist.tag = function(obj){
		var $tag = utils.custom._tag(obj);
		obj._parentDivClass = obj._parentDivClass + " noneditable";
		if(obj.value){
			var value = obj.value;
			for(var i in value){
				$tag.append(checkboxlist._checkbox(value[i]));
			}
		}
		obj._inputClass = "toggleValue value";
		$tag.append(utils.custom._input(obj));
		return $tag;
	};
	checkboxlist._checkbox = function(value){
		if(value) return '<div class="_check checked"></div>';
		return '<div class="_check unchecked"></div>';
	};
	checkboxlist.init = function(){
		//CHEKBOXs
		$("body").delegate(".tag.checkboxlist:not(.readOnly) ._check", "click", function(e){
			var $this = $(this);
			$this.checkboxlistChange(e);
			return;
	    });	
		$("body").delegate(".tag.checkboxlist:not(.readOnly) ._check", "keydown", function(e){
			var $this = $(this);
			var key = (e.keyCode || e.which);
			if(key==13){
				$this.checkboxlistChange();
				preventPropagation(e);
			} return;
		});
	};
	checkboxlist.onChange = function(elem, cb){
		var $widgetDiv = $(elem);
		if(cb==undefined){
			return $("input.toggleValue", $widgetDiv).change();
		}
		$widgetDiv.addClass("onchange");
	    return $("input.toggleValue", $widgetDiv).change(function(e){
	    	var $thisWidget = $(this).parent(".tag");
	    	if($thisWidget.hasClass("readOnly") && $thisWidget.hasClass("yes")) return;
	        if(cb && $thisWidget.isValid()){
	        	e.$widget = $thisWidget;
	        	cb(e,$thisWidget);
	        }
	        //preventPropagation(e);
	    });	
	};
	checkboxlist.setValue = function($this,value){
		for(var i in value){
			if(value[i]-0) $("._check:eq("+i+")",$this).removeClass("unchecked").addClass("checked");
			else $("._check:eq("+i+")",$this).removeClass("checked").addClass("unchecked");
		}
		return value;
	};
	checkboxlist.getValue = function($this,value){
		var value = [];
		$("._check",$this).each(function(index,elem){
			var val = ($(elem).hasClass("checked"))?1:0;
			value.push(val);
		})
		return value;
	};
	$.fn.checkboxlistChange = function(e){
		var $this = this;
		var $widget = $(this).parents(".tag");
		var value = 0;
        if ($this.hasClass("checked")){
        	$this.removeClass("checked");
        	$this.addClass("unchecked");
        } else {
            if($widget.hasClass("toggleCheck")){
            	$("._check",$widget).removeClass("checked");
            } else $this.removeClass("unchecked");
        	$this.addClass("checked");
        	value = 1;
        }
		$("input.toggleValue", $widget).val(value);
		$("input.toggleValue", $widget).change();
		//preventPropagation(e);
	};
});

//////////////////////////////TEXT SELECTION START///////////////////////////
select_namespace("utils.custom.mouse", function(mouse){
	$.fn.getCursorPosition = function(){
	    if(this.lengh == 0) return -1;
	    return $(this).getSelectionStart();
	};
	$.fn.setCursorPosition = function(position){
	    if(this.lengh == 0) return this;
	    return $(this).setSelection(position, position);
	};
	$.fn.getSelection = function(){
	    if(this.lengh == 0) return -1;
	    var s = $(this).getSelectionStart();
	    var e = $(this).getSelectionEnd();
	    return this[0].value.substring(s,e);
	};
	$.fn.getSelectionStart = function(){
	    if(this.lengh == 0) return -1;
	    input = this[0];
	    var pos = input.value.length;
	    if (input.createTextRange) {
	        var r = document.selection.createRange().duplicate();
	        r.moveEnd('character', input.value.length);
	        if (r.text == '') 
	        pos = input.value.length;
	        pos = input.value.lastIndexOf(r.text);
	    } else if(typeof(input.selectionStart)!="undefined")
	    pos = input.selectionStart;
	    return pos;
	};
	$.fn.getSelectionEnd = function(){
	    if(this.lengh == 0) return -1;
	    input = this[0];
	    var pos = input.value.length;
	    if (input.createTextRange) {
	        var r = document.selection.createRange().duplicate();
	        r.moveStart('character', -input.value.length);
	        if (r.text == '') 
	        pos = input.value.length;
	        pos = input.value.lastIndexOf(r.text);
	    } else if(typeof(input.selectionEnd)!="undefined")
	    pos = input.selectionEnd;
	    return pos;
	};
	$.fn.setSelection = function(selectionStart, selectionEnd) {
	    if(this.lengh == 0) return this;
	    input = this[0];
	    if(selectionStart==-1) selectionStart = input.value.length;
	    if(selectionEnd==-1) selectionEnd = input.value.length;
	    if (input.createTextRange) {
	        var range = input.createTextRange();
	        range.collapse(true);
	        range.moveEnd('character', selectionEnd);
	        range.moveStart('character', selectionStart);
	        range.select();
	    } else if (input.setSelectionRange) {
	        input.focus();
	        input.setSelectionRange(selectionStart, selectionEnd);
	    }
	    return this;
	};
	$.fn.getMouseTextPositionIndex = function(e,defIndex){
		var _pos = this.relMouseCoords(e).x;
		var _x = (_pos-4)/5;
		return _x;
	};
	$.fn.relMouseCoords = function(event){
	    var totalOffsetX = 0;
	    var totalOffsetY = 0;
	    var canvasX = 0;
	    var canvasY = 0;
	    var currentElement = this[0];
	    if(!currentElement) return {x :0, y : 0};
	    do{
	        totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft;
	        totalOffsetY += currentElement.offsetTop - currentElement.scrollTop;
	    }
	    while(currentElement = currentElement.offsetParent)

	    canvasX = event.pageX - totalOffsetX;
	    canvasY = event.pageY - totalOffsetY;

	    return {x:canvasX, y:canvasY}
	};
});
//////////////////////////////TEXT SELECTION ENDS///////////////////////////

