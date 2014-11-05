utils.define('utils.navigation').as(function(navigation, _navigation_) {

	utils.require('utils.custom.tag','utils.abstracts.tag');
	var tag = utils.require('utils.custom.tag');
	var abstract_tag = utils.require('utils.abstracts.tag');
	
	// NAVIGATION**********************************************************************************
	navigation._to_modechange = function(elem,toMode,uE,e){
		var uD = uE.detail;
		uD._mode = uD.mode; uD.mode = toMode;
		console.log("_to_modechange",uE,uD)
		if(uD._mode!=uD.mode){
			elem.attr('mode', uD.mode);
	        if (utils.custom[uD.tagType] && utils.custom[uD.tagType].on_modechange) {
	            utils.custom[uD.tagType].on_modechange(elem, uE, e);
	        }
	        if(!uD.navigate){
	        	return utils.preventPropagation(e);
	        }
		}
	};
	
	navigation._ready_ = function() {

		$("body").delegate(".tag", "focusin", function(e) {
	    	var $elem = $(this || e.currentTarget);
	    	var uEvent = utils.custom.extendEvent(e,"focus");
	        return navigation.tagEventHandler($elem,uEvent ,e);
	    });
	    $("body").delegate(".tag", "focusout", function(e) {
	    	var $elem = $(this || e.currentTarget);
	    	var uEvent = utils.custom.extendEvent(e,"blur");
	        return navigation.tagEventHandler($elem,uEvent ,e,'none');
	    });
	    $("body").delegate(".tag", "keydown", function(e) {
	        var $elem = $(this || e.currentTarget);
	        var uEvent = utils.custom.extendEvent(e,"keydown",{ isKeyDownEvent : true });
	        return navigation.tagEventHandler($elem,uEvent,e);
	    });
	    $("body").delegate(".navigate", "keydown", function(e) {
	    	var uD = utils.custom.getEventDetail(e);
	        if (uD && uD.mode == 'select' && uD.navigate) {
	            var $nav = $(this);
	            var isNext = navigation.next_tag($nav,e.uEvent,e);
	            if(isNext!=null) utils.preventPropagation(e)
	        }
	    });
	};
	/*
	utils.custom.defineWidget.extend(function(wSpace) {
		wSpace.on_focus = navigation._on_focus;
	    wSpace.on_blur = navigation._on_blur;
	    wSpace.on_keydown = navigation._on_keydown;
	    wSpace.on_modechange = navigation._on_modechange;
	    wSpace._to_modechange = navigation._to_modechange;
	});*/
	
	navigation.tagEventHandler = function($tag,uE,e,defaultMode){
		var uD = tag.getTagParam($tag, uE.detail);
        var newmode = defaultMode || 'select';
        if(uD.readOnly && uD.isKeyDownEvent){
        	newmode = abstract_tag._on_keydown($tag,e.uE ,e)
        } else if (utils.custom[uD.tagType] && utils.custom[uD.tagType]['_on_'+uD.uEventName]) {
        	try{
        		newmode = utils.custom[uD.tagType]['_on_'+uD.uEventName]($tag, uE, e) || newmode;
        	} catch(e){
        		console.error('eventError:',uD.tagType,uD.uEventName,uE,e)
        	}
        } return navigation._to_modechange($tag,newmode,uE,e);
	}

	navigation.next_tag = function($nav,uE,e){
		var $nextField = this.tag.next(e,uE.detail.$tag,uE.detail.key, $nav);
		if($nextField!==null){
			$nextField.focus();
		} 
		return $nextField;
	}
	
	navigation.tag = {
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
				
				var nextField = this.nextPos(e,key, search.iRow, search.iCol,search.maxRow,search.maxCol,$context.hasClass("rotate"));
	
				if(nextField===null) return nextField;
				//nextField = "r"+search.iRow+".c"+search.iCol;
					
				var $nextField = $.getFirst(".r"+nextField.iRow+".c"+nextField.iCol, $context).filter(":visible");
				//var $nextField = $.getFirst(".r"+nextField.iRow+".c"+nextField.iCol, $context).filter(":visible");
				if($nextField && $nextField.length==0){
					return this.next(e,$curField,key,$context,nextField)
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