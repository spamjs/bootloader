utils.define('utils.navigation').as(function(navigation, _navigation_) {

	var tag = utils.require('utils.custom.tag');
	
	// NAVIGATION**********************************************************************************
	tag.widget_on_focus = function(elem, uE, e) {
		return 'select';
	};
	tag.widget_on_blur = function(elem, uE, e) {
		return 'none';
	};
	tag.widget_on_keydown = function(elem, uE, e) {
		if (utils.is.enter(uE.key)) {
			uE.key = utils.is.down();
			return 'select';
		} else if (uE.readOnly)
			return 'select';
		else
			return uE.mode;
	};
	tag.widget_on_modechange = function(elem, uE, e) {
		if (uE.readOnly)
			return 'select';
		if (uE.mode != 'select') {
			uE.stop(e);
		}
	};
	tag.to_mode_change = function(elem,toMode,uE,e){
		uE._mode = uE.mode; uE.mode = toMode;
		if(uE._mode!=uE.mode){
			elem.setAttribute('mode', uE.mode);
	        if (utils.custom[uE.tagType] && utils.custom[uE.tagType].on_modechange) {
	            utils.custom[uE.tagType].on_modechange(elem, uE, e);
	        }
	        if(!e.uE.navigate){
	        	//utils.preventPropagation(e);
	        	//$(elem).focus();
	        	return utils.preventPropagation(e);
	        }
		}
	};
	
	navigation._ready_ = function() {
		console.info("navigation._ready_")
	    $("body").delegate(".tag", "focusin", function(e) {
	        var elem = this || e.currentTarget || $(this)[0];
	        e.uE = new utils.custom.getEvent('focus');
	        return tag.tagEventHandler(elem,e.uE ,e);
	    });
	    $("body").delegate(".tag", "focusout", function(e) {
	        var elem = this || e.currentTarget || $(this)[0];
	        e.uE = new utils.custom.getEvent('blur');
	        return tag.tagEventHandler(elem,e.uE ,e,'none');
	    });
	    $("body").delegate(".tag", "keydown", function(e) {
	        var elem = this || e.currentTarget || $(this)[0];
	        e.uE = utils.custom.getEventInfo(elem,e,{ isKeyDownEvent : true });
	        return tag.tagEventHandler(elem,e.uE ,e);
	    });
	    $("body").delegate(".navigate", "keydown", function(e) {
	    	console.info("e",e,e.uE)
	        if (e && e.uE && e.uE.mode == 'select' && e.uE.navigate) {
	            var $nav = $(this);
	            if(window.dffKey) return;
	            var isNext = tag.next($nav,e.uE,e);
	            console.info(isNext)
	            if(isNext!=null) e.uE.stop(e)
	        }
	    });
	};
	/*
	utils.custom.defineWidget.extend(function(wSpace) {
		wSpace.on_focus = navigation.widget_on_focus;
	    wSpace.on_blur = navigation.widget_on_blur;
	    wSpace.on_keydown = navigation.widget_on_keydown;
	    wSpace.on_modechange = navigation.widget_on_modechange;
	    wSpace.to_mode_change = navigation.to_mode_change;
	});*/
	
	tag.tagEventHandler = function(elem,uE,e,defaultMode){
        uE.tagType = elem.getAttribute('tagType') || 'none';
        uE.mode = elem.getAttribute('mode') || 'none';
        uE.tagType = elem.getAttribute('tagType') || 'none'
        uE.readOnly = (uE.$widget ? uE.$widget.hasClass('readOnly') : false);
        var newmode = defaultMode || 'select';
        if(uE.readOnly && e.isKeyDownEvent){
        	newmode = tag.widget_on_keydown(elem,e.uE ,e)
        } else if (utils.custom[uE.tagType] && utils.custom[uE.tagType]['on_'+uE.name]) {
        	try{
        		newmode = utils.custom[uE.tagType]['on_'+uE.name](elem, uE, e) || newmode;
        	} catch(e){
        		console.error('eventError:',uE.tagType,uE.name,uE,e)
        	}
        } return tag.to_mode_change(elem,newmode,uE,e);
	}

	tag.next = function($nav,uE,e){
		var $nextField = tag.nav.next(e,uE.$widget,uE.key, $nav);
		if($nextField!==null){
			$nextField.focus();
		} 
		return $nextField;
	}
	
	tag.nav = {
			keyup : function(y){},
			next : function(e,$curField, key , $context, search){
				if(!search){
					var search = {
						iRow : $curField.attr("irow"),
						iCol : $curField.attr("icol"),
						maxRow : $context.attr('maxrow'),
						maxCol : $context.attr('maxcol')
					};
					if(search.iRow===undefined || search.iCol===undefined) return null
					if(!search.iRow)  search.iRow=0;
					if(!search.iCol)  search.iCol=0;
					if(!search.maxRow && !search.maxCol){
						return null;
					}
					
					search.iRow=search.iRow-0;
					search.iCol=search.iCol-0;
					search.maxRow=search.maxRow-0;
					search.maxCol=search.maxCol-0;
					
				}
				
				var nextField = tag.nav.nextPos(e,key, search.iRow, search.iCol,search.maxRow,search.maxCol,$context.hasClass("rotate"));
	
				if(nextField===null) return nextField;
				//nextField = "r"+search.iRow+".c"+search.iCol;
					
				var $nextField = $.getFirst(".r"+nextField.iRow+".c"+nextField.iCol, $context).filter(":visible");
				//var $nextField = $.getFirst(".r"+nextField.iRow+".c"+nextField.iCol, $context).filter(":visible");
				if($nextField && $nextField.length==0){
					return tag.nav.next(e,$curField,key,$context,nextField)
					//return null
				}
				return $nextField;
			} ,
			nextPos : function(e,key,iRow,iCol,maxRow,maxCol,rotate){
				if(key==38){
					iRow = iRow-1;
					if(iRow<0){
						iRow = maxRow;
					}
				} else if(key==40){
					iRow = iRow+1;
					if(iRow>maxRow){
						iRow = 0;
					}
				} else if(key==37){
					iCol = iCol-1;
					if(iCol<0){
						iCol = maxCol;
					}
				} else if(key==39){
					iCol = iCol+1;
					if(iCol>maxCol){
						iCol = 0;
					}
				} else if(key==9){
					if(rotate){
						if(e.shiftKey){
							iCol = iCol-1;
							if(iCol<0){
								iCol = maxCol;
								iRow = iRow-1;
								if(iRow<0) iRow = maxRow;
							}
						} else {
							iCol = iCol+1;
							if(iCol>maxCol){
								iCol = 0;
								iRow = iRow+1;
								if(iRow>maxRow) iRow = 0;
							}
						}
					} else return null;
				}
				return { iRow  : iRow, iCol : iCol,maxRow : maxRow, maxCol : maxCol } ;
			}
	};
});