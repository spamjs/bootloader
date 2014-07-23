utils.selectNamespace("utils.custom.navigation", function(navigation){
	utils.custom.defineWidget.extend(function(wSpace) {
		wSpace.on_focus = function(elem, uE, e) {
	        return 'select';
	    }
	    wSpace.on_blur = function(elem, uE, e) {
	        return 'none';
	    };
	    wSpace.on_keydown = function(elem, uE, e) {
	    	if(uE.readOnly) return 'select';
	        return uE.mode;
	    };
	    wSpace.on_modechange = function(elem, uE, e) {
	    	if(uE.readOnly) return 'select';
	    	if(uE.mode!='select'){
	    		uE.stop(e);
	    	} 	console.log('on_modechange',elem, uE, e)
	    };
	});
	
	navigation.tagEventHandler = function(elem,uE,e,defaultMode){
        uE.tagType = elem.getAttribute('tagType') || 'none';
        uE.mode = elem.getAttribute('mode') || 'none';
        uE.tagType = elem.getAttribute('tagType') || 'none'
        uE.readOnly = (uE.$widget ? uE.$widget.hasClass('readOnly') : false);
        var newmode = defaultMode || 'select';
        if (utils.custom[uE.tagType] && utils.custom[uE.tagType]['on_'+uE.name]) {
        	try{
            newmode = utils.custom[uE.tagType]['on_'+uE.name](elem, uE, e) || newmode;
        	} catch(e){
        		console.error('eventError:',uE.tagType,uE.name,uE,e)
        	}
        }
        return navigation.to_mode_change(elem,newmode,uE,e);
	}
	navigation.init = function() {
	    $("body").delegate(".tag", "focusin", function(e) {
	        var elem = this || e.currentTarget || $(this)[0];
	        e.uE = new utils.custom.event('focus');
	        return navigation.tagEventHandler(elem,e.uE ,e);
	    });
	    $("body").delegate(".tag", "focusout", function(e) {
	        var elem = this || e.currentTarget || $(this)[0];
	        e.uE = new utils.custom.event('blur');
	        return navigation.tagEventHandler(elem,e.uE ,e,'none');
	    });
	    $("body").delegate(".tag", "keydown", function(e) {
	        var elem = this || e.currentTarget || $(this)[0];
	        e.uE = new utils.custom.event('keydown', $(elem));
	        e.uE.key = (e.keyCode || e.which);
	        return navigation.tagEventHandler(elem,e.uE ,e);
	    });
	    $("body").delegate(".navigate", "keydown", function(e) {
	        if (e && e.uE && e.uE.mode == 'select' && e.uE.navigate) {
	            var $nav = $(this);
	            if(window.dffKey) return;
	           // navigation.keydown($nav, e.uE, e);
	            var isNext = navigation.next($nav,e.uE,e)
	            if(isNext!=null) e.uE.stop(e)
	        }
	    });
	};
	
	navigation.to_mode_change = function(elem,toMode,uE,e){
		uE._mode = uE.mode; uE.mode = toMode;
		if(uE._mode!=uE.mode){
			elem.setAttribute('mode', uE.mode);
	        if (utils.custom[uE.tagType] && utils.custom[uE.tagType].on_modechange) {
	            utils.custom[uE.tagType].on_modechange(elem, uE, e);
	        }
	        if(!e.uE.navigate){
	        	e.uE.stop(e);
	        	//$(elem).focus();
	        	return e.uE.stop(e);
	        }
		}
	};
	navigation.next = function($nav,uE,e){
		var $nextField = navigation.tag.next(e,uE.$widget,uE.key, $nav);
		if($nextField!==null){
			$nextField.focus();
		} return $nextField;
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
				
				var nextField = navigation.tag.nextPos(e,key, search.iRow, search.iCol,search.maxRow,search.maxCol,$context.hasClass("rotate"));
	
				if(nextField===null) return nextField;
				//nextField = "r"+search.iRow+".c"+search.iCol;
					
				var $nextField = $.getFirst(".r"+nextField.iRow+".c"+nextField.iCol, $context).filter(":visible");
				if($nextField && $nextField.length==0){
					return navigation.tag.next(e,$curField,key,$context,nextField)
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
	$.fn.mode_edit = function(e,key,ename){
		if(this.hasClass("droption"))
			e.isDroption = true;
		if(this.hasClass('noneditable'))  return;// for Checkbox type widgets
		this.enableEdit(true);
		this.removeClass("mode_select").addClass("mode_edit");
		if(this.hasClass("tokeninput")){
			$("input#token-input-",this).focus();
		} else $("input.display",this).focus();
		this.addClass("focus");
		if(!ename || ename!="dblclick")
			$("input.display",this).select();
		if(ename=="dblclick"){
			$("input.display",this).setCursorPosition(this.getMouseTextPositionIndex(e),-1);
		}
		if(e.isDroption)
			this.addClass("menu_open");
		return true;
	};
	$.fn.mode_none = function(e,key){
		this.removeClass("focus mode_edit").addClass("mode_none");
	};
	$.fn.mode_select = function(e,key){
		this.removeClass("mode_edit mode_edit_display").addClass("mode_select");
	};
	
	$.fn.mode_enter= function(e,key){
		if(this.hasClass("droption")){
			if(this.hasClass("menu_open")){
				if(!e.isModeEdit){
					this.removeClass("menu_open");
					this.mode_select(e,key);
				}
			} else {
				this.addClass("menu_open");
				e.isDroption = true;
				this.mode_edit(e,key,"enter");
			};
		} else if(this.hasClass("amount")){
			$(".amount_toggle", this).focus();
		} else if(this.hasClass("button")){
		} else if(this.hasClass("clickable")){
			this.click();
		} else if(this.hasClass("stringhelp")){
			$(".axn",this).change();
			$(".helpbox",this).empty();
		} else if(this.hasClass("enterOption")){
			$(document.activeElement).click();
		}else{
			this.mode_select(e,key)
		}
	};
	
	$.fn.on_display_blur = function(e,key){
		return;
		if(this.hasClass("amount")){
			if(this.attr("tagtype")=="amount"){
				utils.custom.amount.on_display_blur(this);
			}
		}
	};

	$.fn.valueChange = function(set){
		var newValue = this.val();
		if(this.attr("oldval")!==newValue){
			if(set) this.attr("oldval",newValue)
			return true;
		} else return false;
	};
	
	$.fn.checkPlaceHolder = function(){
		var dispVal = $("input.display",this).val();
		if(dispVal===""){
			var ph = this.attr("placeholder");
			if(ph){
				dispVal = ph;
				this.addClass("lighttext");
			} else{
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
	
	$.fn.enableEdit = function(set){
		if(set){
			$("input.display",this).removeAttr("disabled");
			$("input.display",this).removeClass("dn");
			$("div.display",this).addClass("dn");
			this.addClass("mode_edit focus");
			this.removeClass("lighttext");
		} else {
			//$("input.display",this).attr("disabled","disabled");
			this.removeClass("mode_edit_display mode_edit");
			$("input.display",this).addClass("dn");
			$("div.display",this).removeClass("dn");
			var dispVal = this.checkPlaceHolder();
			$("div.display",this).text(dispVal);
			//this.focus();
		}
	};
	
//	$.fn.focusEdit = function(){
//		$(".tag").removeClass("focus editmode navmode");
//		this.addClass("focus editmode");
//	};
//	$.fn.focusNav = function(){
//		$(".tag").removeClass("focus navmode editmode");
//		this.click();
//		$(".display",$(this)).focus();
//		$(".option",$(this)).focus();
//		this.addClass("focus navmode");
//	};
//	$.fn.focusEnter = function(){
//	};
	$.fn.onBlur = function(){
		this.blur();
		if(this.hasClass("tag"))
			$("input.display",$(this)).blur();
	};
	$.fn.onActive = function(){
		$(".tag").removeClass("focus navmode editmode");
		if(this.hasClass("toggle")){
			//this.toggleChange();
			//(this.parents(".navigate")).focus();
		} else {
			//this.click();
			$(".display",$(this)).focus();
			$(".option",$(this)).focus();
			
		}
		if(this.hasClass("button") || this.hasClass("clickable")){
			this.focus();
		}
		this.addClass("focus navmode editmode");
	};
	$.fn.onFocus = function(){
		this.onActive();
		//(this.parents(".navigate")).focus(); ???? need to test if we really need this ??? cross-bowser
		this.onBlur();
		this.addClass("focus");
		this.focus();
	};
	$.fn.setFocus = function(e){
		//this.focus();
		//(this.parents(".navigate")).focus();
		if(this.hasClass("inputbox") || this.hasClass("date") || this.hasClass("amount") || this.hasClass("droption") ){
			//$(".display",$(this)).focus();
		}
		this.focus();
		this.addClass("focus");
	};
	
	navigation.tag_blur = function(e,$widget){
		$widget.removeClass("focus mode_select");
		if($widget.hasClass("mode_edit_display")){
		} else $widget.mode_none(e,0);
	};
	
	navigation.init2 = function(){
				
		$("body").delegate(".tag", "blur", function(e) {
			var $widget = $(this);
			navigation.tag_blur(e,$widget);
		});
		
		$("body").delegate(".tag div.display", "click", function(e){
			var $widget = $(this).parents(".tag");
			$widget.setFocus(e);
		});
		$("body").delegate(".tag", "focus", function(e){
			var $widget = $(this);
			var $nav = $(this).parents(".navigate");
			if($nav.length){
				$(".tag", $nav).removeClass("focus");
			}
			$widget.addClass("focus");
			if($widget.hasClass("mode_edit")){
			} else $widget.addClass("mode_select");
			e.tagFocus = true;
			//$(".display",$widget).focus();
			if($app) $app.$focus = $widget;
		});

		$("body").delegate(".tag.mode_select:not(.readOnly)", "keydown", function(e){
			var $widget = $(this);
			var key = (e.keyCode || e.which);
			//$widget.onKeyPress();
			if(key==13){
				$widget.mode_enter(e,key, "mode_select:keydown:13");
			} else if(!utils.isNavKey(key)){
				$widget.mode_edit(e,key, "mode_select:keydown:other");
			}
		});
		$("body").delegate(".tag.mode_edit:not(.readOnly)", "keydown", function(e){
			var $widget = $(this);
			var key = (e.keyCode || e.which);
			if(key == 13){
				e.isModeEdit = true;
				$widget.mode_enter(e,key,"mode_edit:keydown:13");
//			} else if(key == 9){
//				e.isModeEdit = true;
//				$widget.mode_tab(e,key);
			} else if($widget.hasClass("droption") && $widget.hasClass("menu_open")){
				e.isDroption = true;
				e.isMenuOpen = true;
			} else if(utils.isNavKey(key) && key!=37 && key!=39){
				$widget.on_display_blur(e,key)
				$widget.mode_select(e,key);
			} else {
//				$C.statusBar.showMessage("mode_select:keydown:other:key:"+key);
			}
		});
		
		$("body").delegate(".tag:not(.readOnly) .display", "dblclick", function(e){
			var $widget = $(this).parents(".tag");
			if($widget.hasClass("mode_edit")){
				//$C.statusBar.showMessage("alreadyIn EditMode");
				$widget.mode_edit(e,0,"mode_edit_dblclick");
			} else $widget.mode_edit(e,0,"dblclick");
		});
		
		$("body").delegate(".tag:not(.readOnly) input.display", "focus", function(e){
			var $widget = $(this).parents(".tag");
			//$widget.addClass("focus")
			$(this).attr("oldval",$(this).val());
			if($widget.hasClass("amount")){
				utils.custom.amount.on_display_focus($widget)
			}
			$widget.addClass("mode_edit_display");
		});
		$("body").delegate(".tag:not(.readOnly) input.display", "blur", function(e){
			var $this = $(this);
			var $widget = $this.parents(".tag");
			$widget.on_display_blur(e,0);
			if($this.valueChange(false)){
				preventPropagation(e);
				$this.change();
			}
			$widget.enableEdit(false);
			$widget.removeClass("mode_edit_display");
		});
		$("body").delegate(".navigate", "keydown", function(e) {
			var $nav = $(this);
			if(window.dffKey) return;
			var key = (e.keyCode || e.which);
			navigation.keydown($nav,key,e);
		});
//TODO:--DISABLED TO TEST:---
//		$("body").delegate(".tag input.display", "change", function(e){
//			var $widget = $(this).parents(".tag");
//		});
		
//TODO:--DISABLED TO TEST:---
//		$("body").delegate(".navigate", "blur", function(e) {
//			var $nav = $(this);
//			//TEMPORARY :: TODO
//			//$(".tag", $nav).removeClass("focus");
//		});
//TODO:--DISABLED TO TEST:---
//		$("body").delegate(".node", "blur", function(e) {
//			var $nav = $(this);
//			//TEMPORARY :: TODO
//			//$(".tag", $nav).removeClass("focus");
//		});
		
	};
	
	navigation.keydown = function($nav,uE,e){
		var navKeys = [38,40,9];
		var navmode = false;
		var key = uE.key;
		var $curField = uE.$widget;//$(".tag.focus",$nav);
		//if($nav.hasClass("navmode")){
		if(!$curField.hasClass("mode_edit")){
			navKeys.push(39,37);
			navmode = true;
		}
		var edit_mode = $curField.hasClass("mode_edit");// return;
		if($curField.length==0) return;
		var selectMode = $curField.hasClass("menu_open") && $curField.hasClass("droption");
		if(selectMode){
			return;
		}
		if($.inArray(key,navKeys) > -1){
			var $nextField = window.utils.tag.next(e,$curField,key, $nav);
			if($nextField!==null){
				//TODO:-- REMOVED THESE TO LINE TO WORK AWESOME IN IE9 only
				//$curField.onBlur();
				//$nav[0].focus();
				//$curField.removeClass("focus");
				//$nextField.addClass("focus");
				$nav.addClass("navmode");
				e.iKey = key;
				$nextField.setFocus(e);
				preventPropagation(e);
				if($nextField.hasClass("error"))
					$nextField.showBubble();
				$nextField.addClass("noselect");
			}
		} else if(key==13) {
			if($curField.hasClass("button")|| $curField.hasClass("clickable")) return;
			$curField.onBlur();
			if(navmode){
				$nav.removeClass("navmode");
			} else {
				if(!selectMode)
					$nav.addClass("navmode");
			}
			if(!selectMode){
				$curField.onActive();
			}
			if(!$curField.hasClass("noenternext")){
				if($nav.hasClass("enter_right"))
					navigation.keydown($nav,39,e);
				else navigation.keydown($nav,40,e);
			} else {
				$(".tag",$curField).focus();
			}
			//
		} else if(key==9) {
			//DO NOTHING OR GO OUT SIDE NAVDIV
			//if(e) preventPropagation(e);
			//$("input.display",$curField).focus();
			//$curField.onActive();
		} else if(key==8) {
			//DO NOTHING OR GO OUT SIDE NAVDIV
			$curField.addClass("editmode");
		} else if(!$curField.hasClass("editmode")){
			//$(".focus",$nav).onActive();
			$curField.addClass("focus");
			$nav.removeClass("navmode");
		}
	}
});