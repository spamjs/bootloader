select_namespace("utils.custom.dropdown", function(dropdown){
//
	dropdown.tag = function(obj){
		var $tag = utils.custom._tag(obj);
		obj._parentDivClass = obj._parentDivClass + " droption"
		if(obj.autosearch) obj._parentDivClass = obj._parentDivClass + " autosearch";
		if(obj.fixed) obj._parentDivClass = obj._parentDivClass + " posFixed";
		obj.attr.title = obj.value;
		if(obj.value===undefined) obj.value = "";
		
		if(obj.options && obj.value){
			obj._display = obj.options[obj.value];
			obj.attr.title = obj._display;
		}
		if((obj._parentDivClass.indexOf("anythingallowed") != -1) && (obj._display == undefined || obj._display == "")){
			var values = obj.value.split("_");
			var dispVal = ""
			for(var i = 1; i < values.length; i++)
				dispVal += " " + values[i];
			dispVal += "(" + values[0].toUpperCase() + ")";
			obj._display = dispVal;
		}
		var $dd = dropdown.dropDownMenu(obj.options,obj);
		$tag.append(utils.custom._display(obj));
		$tag.append(utils.custom._input(obj));
		
		if(obj.tokenURL){
			obj._parentDivClass = obj._parentDivClass + " customtokeninput";
			obj.attr.url = obj.tokenURL;
			obj.attr.method = "GET";
			if(obj.validTokens){
				$("input.value",$tag).attr("validTokens",obj.validTokens);
			}
			if(obj.showExp !== undefined){
				$("input.value",$tag).attr("showExp",obj.showExp);
			}
		}
		$tag.append($dd,'<a class="downArrow closed" tabindex="-1"></a>');	
		return $tag;
	};
	dropdown.setParams = function($this,params){
		var $dd = $(".dropdown_menu",$this);
		var first = utils.custom.dropdown.populateDropDownMenu2($dd,params.options);
		if(params.value==undefined) params.value = first;
		if($this.hasClass("anythingallowed"))
			dropdown.setValue($this,params.value, undefined, params.dispVal);
		else
			dropdown.setValue($this,params.value);
	};
	dropdown.addOption = function($this, params){
		var $sel = $("li.option[data-value='"+params.dVal+"']",$this);
		if($sel && $sel.length){}else{
			var crossSign = params.crossSign;
			var shortcut = params.shortcut;
			if(!shortcut)	params.dDisp.toUpperCase();
			if(!crossSign)	crossSign = "";
			$(".dropdown_menu",$this).append('<li data-display="' + params.dDisp + '" shortcut="' + shortcut 
					+ '" data-value="' + params.dVal + '" class="option ' + crossSign + '">' + params.dDisp + '</li>');
		}
	};
	dropdown.removeOption = function($this, params){
		$("li.option[data-value='" + params.dVal + "']", $this).remove();
	};
	dropdown.setValue = function($this,value,callOnChange, dispVal){
		if((value=="") && $this.hasClass("emptyallowed")){ 
			var dispVal  = "";
			value  = "";
		}else if($this.hasClass("anythingallowed")){
			var $sel = $("li.option[data-value='"+value+"']",$this);
			if($sel && $sel.length){
				dispVal  = $sel.attr("data-display");
				value  = $sel.attr("data-value");
			}else if(!dispVal){
				var values = value.split("_");
				var dispVal = "";
				for(var i = 1; i < values.length; i++)
					dispVal += " " + values[i];
				dispVal += "(" + values[0].toUpperCase() + ")";
			}
		} else {
			var $sel = $("li.option[data-value='"+value+"']",$this);
			if($sel && $sel.length){
			} else 	$sel = $("li.option:eq(0)",$this);
			var dispVal = "";
			if($sel && $sel.length){
				dispVal  = $sel.attr("data-display");
				value  = $sel.attr("data-value");
			} else if($this.hasClass("customtokeninput")){
				dispVal = value;
			}
			//PATCH???????????????START
			if($this.hasClass("toggleinput") && value){
				var x = utils.custom.dropdown.getCur(value);
				value = x.value;
				dispVal = x.dispVal;
			}
		}
		//PATCH???????????????ENDS
		if($this.hasClass("anythingallowed"))
			utils.custom.setDisplay($this,dispVal, value);
		else
			utils.custom.setDisplay($this,dispVal);
		utils.custom.setInputValue($this,value,callOnChange);
		return value;
	};
	dropdown.getOption = function(value, shortcut, name, display,extras, crossSign){
		if(crossSign)
			var option = '<li class="option ' + crossSign + '" data-value="'+value+'" shortcut="'+(shortcut+"").toUpperCase()
		+'" data-display="'+name + '" title="'+display+'" ';
		else
			var option = '<li class="option" data-value="'+value+'" shortcut="'+(shortcut+"").toUpperCase()
			+'" data-display="'+name + '" title="'+display+'" ';
		for(var key in extras){
			if(key!='value' && key!='display') option += (' data-'+key + '="'+extras[key]+'" ');
		}
		if(crossSign)	return option + ' >'+display+'<span class="xicon">x</span></li>';
		else	return option + ' >'+display+'</li>';
	};
	dropdown.dropDownMenu = function(options,obj){
		var $dd = $('<ul class="dropdown_menu dn"></ul>');
		if(options)
			dropdown.populateDropDownMenu2($dd,options,obj);
		return $dd;
	};
	dropdown.populateDropDownMenu2 = function($dd,options,obj){
		$dd.empty();
		if(!obj) var obj = {}
		for(var i in options){
			var option = options[i];
			if(typeof(options[i])=='object'){
				if(option.subMenu){
					var $li = $('<li class="subMenu" title="'+option.label+'">'+option.label +'</li>');
					var $ul = $('<ul></ul>');
					dropdown.populateDropDownMenu2($ul,option.subMenu,obj);
					$dd.append($li.append($ul));
				} else {
					if(obj.value==undefined || obj.value==option.value){
						obj.value = option.value;
						obj._display = option.displayLabel;
					}
					$dd.append(dropdown.getOption(option.value, option.shortcut, option.displayLabel,option.label, option.extras, option.crossSign));
				}
			} else {
				if(obj.value== undefined){
					obj.value = i;
					obj._display = option;
				}
				$dd.append(dropdown.getOption(i, option, option,option));
			}
		}
		return obj.value;
	};
	dropdown.populateDropDownMenu = function($dd,resp){
		$dd.empty();
		if(resp.length)
			for(var i=0; i<=5 && resp[i]; i++){
				if(resp[i].display===undefined) resp[i].display = resp[i].name;
				if(resp[i].id){
					//var $option = 
					$dd.append(dropdown.getOption(resp[i].id, resp[i].display, resp[i].name, resp[i].display,resp[i]));
					//$dd.data(resp);//TODO:--lalit??
				} else {
					$dd.append('<li class="option" data-value="" data-display="" >'+resp[i].display+'</li>');
				}
			}
		else $dd.append('<li class="option" data-value=" " data-display=" " >No Results Found</li>');
	};
	dropdown.init = function(){
		$.fn.sideUpDown = function(){
			var $this = $(this);
			if ($this.length == 0)
				return;
			var $parent = $this.parents('.tag');
			var pTop = $parent.offset().top;
			var pLeft = $parent.offset().left;
			var top = pTop-65;
			var height = window.innerHeight-112;
			var bottom = height - top - 28;
			var tenRows = 20*5;
			var posClass = (bottom<tenRows && top > tenRows)? 'upSide' : 'downSide';
			if(!$('ul',$this).length){
				var maxHeight = (posClass=='upSide')? top : bottom ;
				this.css('max-height', maxHeight).addClass('isScroll');				
			} 
			this.removeClass('upSide downSide').addClass(posClass);
			if($parent.hasClass('posFixed')){
				var map = { 
						top : (posClass=='upSide') ? 'auto' : (pTop-0+23),
						bottom : (posClass=='upSide') ? (window.innerHeight - pTop) : 'auto',
						left : pLeft,
						'min-width' : $parent.width()
					}
				this.css(map)
			}
		};
		$.fn.showDropDown = function(yes, searching){
			if(yes==undefined || yes){
				this.addClass("menu_open");
				if(!searching) $(".dropdown_menu li",this).removeClass("dn hover phover");
				$(".dropdown_menu", this).removeClass("dn");
				$(".dropdown_menu", this).sideUpDown();
			} else {
				this.removeClass("menu_open");
				$(".dropdown_menu",this).addClass("dn");
				 $(".dropdown_menu li",this).removeClass("focus");
			}
		};
		$("body").delegate(".droption.tag span.xicon", "click", function(e){
			$(this).parent("li").addClass("toBeDeleted");
			$(this).parents(".dropdown_menu").change();
			preventPropagation(e);
			$(this).closest("div").removeClass("menu_open");
			$(".dropdown_menu").addClass("dn");
		});
		
		$("body").delegate(".droption.tag .dropdown_menu", "mouseenter", function(e){
			var $widget = $(this).parents(".droption.tag");
			$widget.addClass("mouseenter");
		});
		$("body").delegate(".droption.tag .dropdown_menu", "mouseleave", function(e){
			var $widget = $(this).parents(".droption.tag");
			$widget.removeClass("mouseenter");
		});
		//DROPDWON2 WIDGET
		$("body").delegate(".dropdown.tag .dropdown_menu", "blur", function(e){
			$(".dropdown_menu").addClass("dn");
		});

		$("body").delegate(".tag.droption", "focusout", function(e) {
			var $widget = $(this);//.parents(".tag");
			if(!$widget.hasClass("mouseenter"))
				$widget.showDropDown(false);
		});
		
		$("body").delegate(".dropdown.tag input.display", "change", function(e){
			var $this = $(this);
			var $widgetDiv = $(this).parents(".dropdown.tag");
			var xVal = $("input.value", $widgetDiv).val();
			var xdVal = $("li.option[data-value='"+xVal+"']",$widgetDiv).attr("data-display");
			var dispVal = $(this).val();
			//if($widgetDiv.hasClass("shortcut")){
				if(dispVal){
					var shortcut = dispVal.toUpperCase();
					var $opt = $(".option[shortcut='"+shortcut+"']", $widgetDiv);
					if($opt.length){
						return $opt.optionSelect();
					}
				}
			//}
			if(xdVal!==undefined){
				$(".input.display", $widgetDiv).val(xdVal);
//			} else if($widgetDiv.hasClass("customtokeninput")){
//				var userInput = $("input.display",$widgetDiv).val();
//				var $option = dropdown.getOption(dispVal,dispVal,dispVal,dispVal);
//				$(".dropdown_menu", $widgetDiv).prepend($option);
//				return $option.optionSelect();
//				//$widgetDiv.showDropDown(false);
			} else $("input.display", $widgetDiv).val("");

			if(!dispVal){
				if($widgetDiv.hasClass("emptyallowed")){ 
					$("input.value", $widgetDiv).val(dispVal);
				} else 
					dispVal = xdVal;
				$(".input.display", $widgetDiv).val(dispVal);
			}
		});

		$("body").delegate(".toggleinput.tag input.display", "change", function(e){
			var $widgetDiv = $(this).parents(".tag");
			var value = $widgetDiv.getValue();
			var dispVal = $(this).val();
			if(!dispVal && $widgetDiv.hasClass("emptyallowed")){ 
				$(".input.value", $widgetDiv).val(dispVal);
			} else {
				if(dispVal){
					var shortcut = dropdown.filterCurString(dispVal);;
					var $opt = $(".option[data-value='"+shortcut+"']", $widgetDiv);
					if($opt.length) return $opt.optionSelect();
				}
				dispVal = $("li.option[data-value='"+value+"']",$widgetDiv).attr("data-display");
			}
			if(dispVal) dispVal = dropdown.getCur(dispVal).dispVal;
			$(".input.display", $widgetDiv).val(dispVal);
		});
		
		$("body").delegate(".dropdown.tag:not(.readOnly.yes) .downArrow", "click", function(e){
			var $this = $(this).parents(".tag");
			if($this.hasClass(".menu_open")){
				$this.showDropDown(false);
			} else $this.showDropDown(true);
			$('li.option',$this).removeClass('focus');
			//$(this).addClass("open").removeClass("closed");
		});
		$("body").delegate(".droption.tag li", "click", function(e){
			e.propagate = true;
			$(this).optionSelect(e);
		});
		

		$("body").delegate(".droption.tag:not(.readOnly.yes)", "keydown", function(e){
			//var $this = $(this);
			var $widget = $(this);//.parents(".dropdown.tag");
			var k = (e.keyCode || e.which);
			if(k==9){
				$widget.showDropDown(false);
				$widget.setFocus();
			}
		});
		
		$("body").delegate(".dropdown.tag:not(.readOnly.yes):not(.menu_open)", "keyup", function(e){
			//var $this = $(this);
			var $widgetDiv = $(this);//.parents(".dropdown.tag");
			var k = (e.keyCode || e.which);
			if(!utils.isNavKey(k,true)){ //NOT A NAVIGATION KEY
				if($widgetDiv.hasClass("autosearch"))
					$widgetDiv.addClass("menu_open");
			}
		});
		
		dropdown.chacheMap = {};
		
		dropdown.tokenCall = function(e,eVal){
			var validTokens = $("input.value",e.$widgetDiv).attr("validTokens");
			var showExp = $("input.value",e.$widgetDiv).attr("showExp");
			var curPos =  e.$disp.getCursorPosition();
			var $dd = $(".dropdown_menu", e.$widgetDiv);
			if(e.cache && dropdown.chacheMap[e.tokenURL+"?q="+key+e.query]){
				dropdown.populateDropDownMenu($dd,dropdown.chacheMap[e.tokenURL+"?q="+key+e.query]);
			} else {
				var query = {};
				if(e.query){
					var _query = e.query.split("&");
					for(var i in _query){
						var keyval = _query[i].split("=");
						query[keyval[0]] = keyval[1];
					}
				} query.q = eVal; query.c = curPos; query.c = curPos; query.validTokens =validTokens; query.showExp = showExp;
				utils.getJSON(e.tokenURL,function(resp){
					if(e.cache) dropdown.chacheMap[e.tokenURL+"?q="+eVal] = resp;
					dropdown.populateDropDownMenu($dd,resp);
				},query,{cache : false, type : e.method, error400 :  e.error400});
			}
		}
		
		$("body").delegate(".dropdown.tag li.subMenu", "hover", function(e){
			$("ul",$(this)).sideUpDown();
		});
		
		dropdown.droption_keyUP = function(e){
			var $this = e.$this;
			var $widgetDiv = e.$widgetDiv
			var k = (e.keyCode || e.which);
			var $disp = e.$disp= $("input.display",$widgetDiv);
			var eVal = $disp.val();
			var searching = false;
			e.isArrow = utils.isArrowKey(k)
			if(e.toSearch && !e.isArrow){
					var key = eVal;
					if(key) key = key.toLowerCase();
					$widgetDiv.addClass("menu_open");
					if(e.token){
						dropdown.tokenCall(e,key);
					} else {
						searching = true;
						$(".dropdown_menu .option", $widgetDiv).each(function(){
							var $opt = $(this);
							$opt.addClass('dn');
							if($widgetDiv.hasClass("startsWith")){
								if($opt.attr('data-display').toLowerCase().indexOf(key) == 0)
									$opt.removeClass('dn');
							}else{
								if($opt.attr('data-display').toLowerCase().indexOf(key)!=-1)
									$opt.removeClass('dn');
								else if($opt.attr('data-value').toLowerCase().indexOf(key)!=-1){
									$opt.removeClass('dn');
								}
							}							
						});
					}
			} else if(e.token && e.toSearch && (k==39||k==37)){
					dropdown.tokenCall(e,eVal);
			}
			
			if(k==13){
				$widgetDiv.showDropDown(true,searching);
				var $sel = $(".dropdown_menu li.focus",$widgetDiv);
				
				if($widgetDiv.hasClass("shortcut")){
					var shortcut = $("input.display",$widgetDiv).val();
					if(shortcut){
						shortcut = shortcut.toUpperCase();
						var $opt = $(".option[shortcut='"+shortcut+"']", $widgetDiv);
						if($opt.length) return $opt.optionSelect();
					}
				}
				if($sel && $sel.length){
					$widgetDiv.showDropDown(false);
					$sel.optionSelect();
					return;
				}
//				if(e.tokenURL){
//					var userInput = $("input.display",$widgetDiv).val();
//					var $option = dropdown.getOption(userInput,userInput);
//					$(".dropdown_menu", $widgetDiv).append($option);
//					return $option.optionSelect();
//				}
				$("li", $widgetDiv).removeClass('focus dn');
				return;
			} else if(k==27){
				$widgetDiv.showDropDown(false);
				return;
			}
			$widget = $widgetDiv;
			if(e.autosearch && $widgetDiv.hasClass("menu_open"))
				$widgetDiv.showDropDown(true,searching || e.isArrow);
			var $thisCol = $(".dropdown_menu", $widgetDiv);
			var $now = $(".dropdown_menu li.focus:not(.dn)", $widgetDiv);
			if($now.length>0)
				$thisCol = $now.parent();

			$("li", $thisCol).removeClass('focus pfocus');
			var changeTest = false;
			if(e.keyCode==32){
				$now.click();
			} else if(k==40) {
				$now = $($now.next());
				while($now.hasClass('dn') || $now.hasClass('disabled')) $now = $($now.next());
				changeTest = true;
			} else  if(k==38) {
				$now = $($now.prev());
				while($now.hasClass('dn')|| $now.hasClass('disabled')) $now = $($now.prev());
				changeTest = true;
			} else if(k==39){
				$now.addClass('pfocus');
				$now = $("ul li:not(.dn):eq(0)", $now);
				$thisCol = $now.parent();
			} else if(k==37){
				$now = $now.parents('li');
				$now.removeClass('pfocus');
				$thisCol = $now.parent();
			} else  if(k==9){ 
				$widgetDiv.showDropDown(false);
			} //else	$(".dropdown_menu", $widgetDiv).removeClass("dn");
			if($now.length==0)
				$now = $("li:not(.dn):not(.disabled):eq(0)", $thisCol);
			if(k!=9){
				$now.addClass('focus');
				if($now.length && changeTest){
					utils.custom.setDisplay($widgetDiv,$now.attr('data-display'));
				}
			}
			$('ul',$now).sideUpDown();
			$thisCol.scrollTo($now);
		};
		
		$("body").delegate(".dropdown.tag.menu_open input.display, .dropdown.tag:not(.readOnly.yes) .downArrow", "keyup", function(e){
			e.$this = $(this);
			e.$widgetDiv = $(this).parents(".dropdown.tag");
			if(e.$widgetDiv.hasClass("readOnly") && e.$widgetDiv.hasClass("yes")) return ;
			e.autosearch = e.$widgetDiv.hasClass("autosearch");
			e.toSearch = (e.autosearch && e.$widgetDiv.hasClass("menu_open"));
			if(e.$widgetDiv.hasClass("customtokeninput")){
				e.token = true;
				e.tokenURL = e.$widgetDiv.attr("url");
				e.method = e.$widgetDiv.attr("method");
				e.query = e.$widgetDiv.attr("query");
				e.error400 = e.$widgetDiv.attr("error400");
				e.autosearch = true;
				e.cache = e.$widgetDiv.hasClass("cached");
				e.keyCharCode = (e.keyCode || e.which);
				e.toSearch = true;
				if(e.keyCharCode==13){
					e.toSearch = false; ///(e.autosearch && e.$widgetDiv.hasClass("menu_open"));
					e.token = false;
				}
			}
			dropdown.droption_keyUP(e);
		});
		
//		$('body :not(.dropdown_menu)').click(function(){
//			$(".dropdown_menu").addClass("dn");
//		});
		
		////////////////////////////////////////////////////////////////////////////////////////////
		dropdown.filterCurString = function(key){
			return key.toUpperCase().replace(/[ \/\\]/gi, "");
		}
		
		$.fn.toggleinputDisplay_keyUp = function(e){
			var $this = $(this);
			var navMode = false;
			var navDiv = $(this).parents(".navigate");
			if(!navDiv || (navDiv.length==0)){}
			else if(navDiv.hasClass("navmode")){
				navMode = true;
			}
			var navKeys = [37,38,39,40,9];
			
			var $widgetDiv = $(this).parents(".toggleinput.tag");
			var k = e.keyCode;
			var searching = false;
			if($widgetDiv.hasClass("autosearch") && ($.inArray(k,navKeys)==-1)){
				var key = $this.val();
				var oVal = $widgetDiv.getValue();
				if(key) key = dropdown.filterCurString(key);
				$widgetDiv.addClass("menu_open");
				var searchCount = 0;
				$(".dropdown_menu .option", $widgetDiv).each(function(index,elem){
					$inthis = $(this);
					$inthis.removeClass('dn');
					var val = $inthis.attr("data-value"); //.replace(/ /gi, "").replace(/\//gi, "");
					var index = -1;
					if(val) index =  val.toUpperCase().indexOf(key);
					if((index==0) && (searchCount<500)){
						searchCount++;
					} else {
						$inthis.addClass('dn');
					}
//					if((val && (index!==1 && index!==3)) || (searchCount>50)){
//						$(this).addClass('dn');
//					} else searchCount++;
				});
				searching = true;
				if(searchCount==0) {
					//$this.select();
					//preventPropagation(e);
				}
			}
			if(e.keyCode==13){
				$widgetDiv.addClass("menu_open");
				var $sel = $(".dropdown_menu li.hover",$widgetDiv);
				$widgetDiv.showDropDown(true);
				//$(".dropdown_menu", $widgetDiv).removeClass("dn");
				if($sel && $sel.length){
					$sel.optionSelect();
					$widgetDiv.removeClass("menu_open");
				}
				$("li", $widgetDiv).removeClass('hover dn');
				//$("li", $thisCol).removeClass('hover');
				return; //preventPropagation(e);
			}  else if(e.keyCode==27){
				$widgetDiv.removeClass("menu_open");
				$("li", $widgetDiv).removeClass('hover dn');
				//$(".dropdown_menu", $widgetDiv).addClass("dn");
				$widgetDiv.showDropDown(false);
				return;
			}
			$widget = $widgetDiv;
			//$(".dropdown_menu", $widgetDiv).removeClass("dn");
			var $thisCol = $(".dropdown_menu", $widgetDiv);
			var $now = $(".dropdown_menu li.hover:not(.dn)", $widgetDiv);
			$widgetDiv.showDropDown(true,searching); //HERE
			if($now.length>0)
				$thisCol = $now.parent();

			$("li", $thisCol).removeClass('hover phover');
			var changeTest = false;
			if(e.keyCode==32){
				//$now.click();
			} else if(e.keyCode==40) {
				$now = $($now.next());
				while($now.hasClass('dn') || $now.hasClass('disabled')) $now = $($now.next());
				changeTest = true;
			} else  if(e.keyCode==38) {
				$now = $($now.prev());
				while($now.hasClass('dn') || $now.hasClass('disabled')) $now = $($now.prev());
				changeTest = true;
			} else if(e.keyCode==39){
				$now.addClass('phover');
				$now = $("ul li:not(.dn):eq(0)", $now);
				$thisCol = $now.parent();
			} else if(e.keyCode==37){
				$now = $now.parents('li');
				$now.removeClass('phover');
				$thisCol = $now.parent();
			} else  if(e.keyCode==9){ 
				$(".dropdown_menu", $widgetDiv).addClass("dn");
				$widgetDiv.removeClass("menu_open");
			} else	$widgetDiv.showDropDown(true,searching);
			if($now.length==0)
				$now = $("li:not(.dn):eq(0)", $thisCol);
			if(e.keyCode!=9){
				$now.addClass('hover');
				if($now.length && changeTest){
					utils.custom.setDisplay($widgetDiv,$now.attr('data-display'));
					utils.custom.setInputValue($widgetDiv,$now.attr('data-value'));
				}
			}
			$('ul',$now).sideUpDown();
			$thisCol.scrollTo($now);
		};
		//TOGGLE INPUT
		$("body").delegate(".toggleinput.tag:not(.readOnly) input.display", "keyup", function(e){
			var $this = $(this);
			$this.toggleinputDisplay_keyUp(e);
		});
		$("body").delegate(".tagwrapper .xtoggle", "click", function(){
			var $wrapper = $(this).parents(".tagwrapper");
			dropdown.inputToggle($(".tag:not(.readOnly)",$wrapper));
		});
		$("body").delegate(".tagwrapper .xtoggle", "keyup", function(e){
			var $wrapper = $(this).parents(".tagwrapper");
			var k = (e.keyCode || e.which);
			if(k==13) dropdown.inputToggle($(".tag:not(.readOnly)",$wrapper));
		});
	};
	
	dropdown.inputToggle = function($this){
		var cur = $("input.display",$this).val();
		if(cur) cur = dropdown.getCur(cur, true) ; else return;
		utils.custom.setDisplay($this,cur.dispVal);
		$("input.value",$this).val(cur.value);
		$this.onChange();
		$this.blur();
	};
	
	dropdown.curDSign = '*';
	dropdown.curISign = 'NDF';
	dropdown.getCur = function(input, reverse){
		var value = dropdown.filterCurString(input);
		
		var NDF = false;
		if(value.indexOf(dropdown.curDSign)!=-1 || value.indexOf(dropdown.curISign)!=-1 ){
			NDF = true;
			value = value.replace(dropdown.curDSign,'').replace(dropdown.curISign,'');
		}
		var assetCur = value.substr(0,3);
		var numerCur =  value.substr(3,3);
		var dispVal = assetCur + " / " + numerCur;
		if(reverse){
			dispVal = numerCur + " / " + assetCur;
			value = numerCur + assetCur;
		}
		return { dispVal : dispVal + (NDF ? dropdown.curDSign : '') , value : value + (NDF ? dropdown.curISign : '')};
	};
	
	dropdown.onFocus = function($widgetDiv){
		$("input.display",$widgetDiv).select();
	};
	
	$.fn.resetOptions = function(optionList){
		var $this = $(this);
		var curVal = this.getValue();
		if(optionList)
			$(".option", $this).addClass("disabled");
		for(var i in optionList){
			$(".option[data-value='"+optionList[i]+"']", $this).removeClass("disabled");
		}
		$(".option:not(.disabled):eq(0)", $this).optionSelect({propagate : false});
		$(".option[data-value='"+curVal+"']:not(.disabled):eq(0)", $this).optionSelect({propagate : false});
	};
	
	$.fn.optionSelect = function(e){
		var $option = $(this)
		var $widgetDiv = $option.parents(".tag.droption");
		if(e==undefined) var e = {propagate : true};
		
		if($widgetDiv.hasClass("toggleinput")){
			var dataValue = $option.text();
			if(dataValue){
				var x = dropdown.getCur(dataValue);
				utils.custom.setDisplay($widgetDiv,x.dispVal)
				$("input.value", $widgetDiv).val(x.value);
				//$("input.display", $widgetDiv).blur();
				if(e.propagate) $("input.value", $widgetDiv).change();
			}
			$(".dropdown_menu li", $widgetDiv).removeClass("hover");
			//$(".dropdown_menu").addClass("dn");
			//$widgetDiv.focus();
		} else if($widgetDiv.hasClass("dropdown")){
			//var $widgetDiv = $(this).parents(".dropdown.tag").parent();
			var dataValue = $option.attr("data-value");
			var displayValue = $option.attr("data-display");
			$widgetDiv.removeClass("menu_open");
			if(dataValue){
				utils.custom.setDisplay($widgetDiv,displayValue);
				$widgetDiv.data($option.data())
				$("input.value", $widgetDiv).val(dataValue);
				//$("input.display", $widgetDiv).blur();
				$widgetDiv.setInvalid();
				if(e.propagate) $("input.value", $widgetDiv).change();
			}
		}
		$widgetDiv.showDropDown(false);
		$widgetDiv.mode_select(e);
		//$widgetDiv.enableEdit(false);
	};
});

select_namespace("utils.custom.stringhelp", function(stringhelp){
	
	stringhelp.closeHelp = function($widget){
		$(".helpbox",$widget).empty();
	};
	stringhelp.init = function(){
		
		$("body").delegate(".stringhelp.tag input.display", "blur", function(e){
			var $this = $(this);
			var $widget = $this.parents(".tag.stringhelp");
			stringhelp.closeHelp($widget);
			$(".helpbox",$widget).addClass('dn');
		});
		$("body").delegate(".stringhelp.tag", "dblclick", function(e){
			e.displayFocused=!(e.keyCharCode==13);
			return stringhelp.keyUP($(this).find('input.display'),e);
		});
		$("body").delegate(".stringhelp.tag:not(.readOnly) input.display", "keyup", function(e){
			return stringhelp.keyUP(this,e);
		});
		stringhelp.keyUP = function(_this,e){
			var $this = $(_this);
			var $widget = $this.parents(".tag.stringhelp");
			if(!e.displayFocused && e.type!='keyup') return
			e.keyCharCode = (e.keyCode || e.which);			
			if(!utils.isNavKey(e.keyCharCode) || e.displayFocused){
				var url = $widget.attr("tokenurl");
				var query = {};
				query.q = $this.val();
				query.c = $this.getCursorPosition();
				$(".helpbox",$widget).removeClass('dn');
				utils.getJSON(url,function(resp){
					var $dispDiv = $(".helpbox",$widget).empty();
					for(var i in resp){
						if(resp[i].display==undefined) resp[i].display = resp[i].name;
						if(resp[i].display) $dispDiv.append('<span>'+resp[i].display+'</span>');
					}
				},query);
			} else if(e.keyCharCode==13){
				stringhelp.closeHelp($widget);
			}
		};
	};
});

select_namespace("utils.custom.tokeninput", function(tokeninput){
	
	tokeninput.init = function(){
	};
	
	$.fn.resetTokenInput = function(obj){
		$('.tokeninput.'+obj.cssClass, $(this)).each(function(){
			var $widget = $(this);
			var url = $widget.attr("url");
			if(url == null || url == undefined)	url = obj.url;
			url = url+"?uitoken="+window.uitoken;
			if($widget.hasClass("init")) return;
			$widget.addClass("init");
			var opts = ""+$(".values",$widget).text();
			var jOpts = [];
			var $div = $('<div class="readOnlyDiv dn"></div>');
			opts = utils.parse(opts);
			if(opts && !opts.error){
				for(var i in opts){
					jOpts[jOpts.length] = {id : i, name : opts[i]};
					$div.append('<div id="'+i+'">'+opts[i]+'</div>');
				}
			}

			{//TODO:-PATCH NEET TO BE UPDATED FOR EACH RESET CALL
				if(!obj.noResultsText && (url=="cals" || obj.cssClass=="cals"))
					obj.noResultsText = "No calendar found";
				else obj.noResultsText = "No results found";
			}//PATCH ENDS.
			if(obj.tokenLimit==undefined){
				obj.tokenLimit = null
				var tokenLimit = $widget.attr("tokenLimit");
				if(tokenLimit && tokenLimit>0) obj.tokenLimit = tokenLimit;
			}
			if(obj.jsonContainer==undefined)
				obj.jsonContainer = null
			
			$("input.input",$widget).tokenInput(url,{
					prePopulate:jOpts,
					theme:"facebook",
					preventDuplicates : true,
					jsonContainer : obj.jsonContainer,
					tokenLimit : obj.tokenLimit,
					noResultsText : obj.noResultsText,
					onAdd : function(e){
						if(!e.prevent) $("input.value",$widget).change();
					},
					onDelete : function(e){
						$("input.value:not(.preventOnchnage)",$widget).change();
					},
					resultsFormatter : obj.resultsFormatter
			});
			$widget.append($div);
			if($widget.hasClass("readOnly")){
				$(".token-input-list-facebook",$widget).addClass("dn");
				$(".readOnlyDiv",$widget).removeClass("dn");
			} else {
				$(".token-input-list-facebook",$widget).removeClass("dn");
				$(".readOnlyDiv",$widget).addClass("dn");
			}
			var tabindex = $("input.input",$widget).attr("tabindex");
			$widget.attr("tabindex",tabindex)
			$("li.token-input-input-token-facebook input",$widget).attr("tabindex",-1);
		});	
	};
	
	tokeninput.setValue = function($this,value, callOnChange){
		var opts = (isEmpty(value))? {} : utils.parse(value)
		$("input.value",$this).addClass('preventOnchnage');
		$("input.input",$this).tokenInput("clear");
		$("input.value",$this).removeClass('preventOnchnage');
		var $div = $('<div class="readOnlyDiv"></div>');
		if(!opts || (typeof(opts)=="string")) return;
		for(var i in opts) {
			$("input.input",$this).tokenInput("add", {id: i, name: opts[i], prevent  : !callOnChange });
			$div.append('<div id="'+i+'">'+opts[i]+'</div>');
		}
		$(".readOnlyDiv",$this).html($div);
		$(".token-input-dropdown-facebook").hide();
	};
});
