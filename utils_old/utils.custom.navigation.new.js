select_namespace("utils.custom.navigation", function(navigation){
	navigation.keyMap = { 37: "isLEFT", 38: "isUP", 39: "isRIGHT", 40: "isDOWN", 9 : 'isTAB' , 13 : 'isENTER' }
	navigation.getMode = function($curField,e){
		if($curField.length==0 || !e) return;
		e.isEditMode = $curField.hasClass("mode_edit");
		if(!e.iKey && e.isEditMode) return 3;//EDIT MODE
		e.isMenuMode = $curField.hasClass("mode_menu") || ($curField.hasClass("menu_open") && $curField.hasClass("droption"));
		e[navigation.keyMap[e.iKey]] = true;
		e.isARROW = (e.isUP || e.isDOWN || e.isRIGHT || e.isLEFT);
		var fun = $curField.EXEC('getMode');
		if(!(e.isARROW || e.isTAB || e.isENTER)){
			return fun(e,3); //EDIT MODE
		} else if((e.isRIGHT || e.isLEFT) && e.isEditMode){
			return fun(e,3); //EDIT MODE
		} else if(e.isARROW && e.isMenuMode){
			return fun(e,2); //MENU MODE
		} else return fun(e,1); //NAV MODE
	};
	navigation.mode_edit = function($curField,e,key,ename){
		e.isDroption = e.isDroption || ($curField.hasClass("droption"))
		$curField.enableEdit(true);
		
		if($curField.hasClass("tokeninput")){
			$("input#token-input-",$curField).focus();
		} else $("input.display",$curField).focus();
		
		$curField.addClass("focus");
		if(!ename || ename!="dblclick")
			$("input.display",$curField).select();
		if(ename=="dblclick"){
			$("input.display",$curField).setCursorPosition($curField.getMouseTextPositionIndex(e),-1);
		}
		if(e.isDroption)
			$curField.addClass("menu_open");
		return true;
	};
	navigation.enableEdit = function($c,set){
		if(set){
			$c.removeClass("mode_select").addClass("mode_edit");
			$("input.display",$c).removeAttr("disabled");
			$("input.display",$c).removeClass("dn");
			$("div.display",$c).addClass("dn");
			$c.addClass("mode_edit focus");
			$c.removeClass("lighttext");
		} else {
			//$("input.display",this).attr("disabled","disabled");
			$c.removeClass("mode_edit_display mode_edit");
			$("input.display",$c).addClass("dn");
			$("div.display",$c).removeClass("dn");
			var dispVal = $c.checkPlaceHolder();
			$("div.display",$c).text(dispVal);
			//this.focus();
		}
	};
	navigation.init = function(){
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
			LOG.timer('tag.keydown',true)
			var $widget = $(this);
			var key = (e.keyCode || e.which);
			//$widget.onKeyPress();
			if(key==13){
				$widget.mode_enter(e,key, "mode_select:keydown:13");
			} else if(!utils.isNavKey(key)){
				$widget.mode_edit(e,key, "mode_select:keydown:other");
			}
			LOG.timer('tag.keydown')
		});
		$("body").delegate(".tag.mode_edit:not(.readOnly)", "keydown", function(e){
			var $widget = $(this);
			var key = (e.keyCode || e.which);
			if(key == 13){
				e.isModeEdit = true;
				$widget.mode_enter(e,key,"mode_edit:keydown:13");
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
	};
	
	navigation.tag_blur = function(e,$widget){
		$widget.removeClass("focus mode_select");
		if($widget.hasClass("mode_edit_display")){
		} else $widget.mode_none(e,0);
	};
	
	navigation.keydown = function($nav,key,e){
		var navKeys = [38,40,9];
		var navmode = false;
		
		var $curField = $(".tag.focus",$nav);
		if($curField.length==0) return;
		e.iKey = key;
		var mode = navigation.getMode($curField,e);
		LOG.warn('mode=',mode,e.iKey)
		if(mode == 1){
			var $nextField = window.utils.tag.next(e,$curField,e.iKey, $nav);
			if($nextField!==null){
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
	
	window.utils.tag = {
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
				
				var nextField = window.utils.tag.nextPos(e,key, search.iRow, search.iCol,search.maxRow,search.maxCol,$context.hasClass("rotate"));
	
				if(nextField===null) return nextField;
				//nextField = "r"+search.iRow+".c"+search.iCol;
					
				var $nextField = $(".r"+nextField.iRow+".c"+nextField.iCol+":visible", $context);
				if($nextField && $nextField.length==0){
					return window.utils.tag.next(e,$curField,key,$context,nextField)
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
		} else if("stringhelp"){
			$(".axn",this).change();
			$(".helpbox",this).empty();
		} else{
			this.mode_select(e,key)
		}
	};
	
	$.fn.on_display_blur = function(e,key){
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
});