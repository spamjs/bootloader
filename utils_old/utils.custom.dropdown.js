utils.custom.defineWidget("dropdown", function(dropdown){
//
	dropdown.extendAttrs(['search','query','validTokens']);
	var inputBoxEditing = true,dropDownHover = false;
	var isMenuOpen=null,$dropDownWidget,$display,$dropDownMenu,$dropDownOptions,$parentMenu;
	dropdown.init = function(){
		dropdown.on("input.display", "change", function(e){
			var $this = $(this);
			var $widget = $this.parents(".tag");
			//inputbox.valueOnChange($this,e);
		});
		dropdown.on(".downArrow", "click", function(e,uE){
			return utils.custom.navigation.to_mode_change(uE.$widget[0],'edit',uE,e);
		});
		dropdown.on(".dropdown_menu", "hover", function(e,uE){
			dropDownHover = (uE.name=='mouseenter');
		});
		dropdown.on(".option", "click", function(e,uE){
			dropDownHover = false;
			var $selected = $(e.target);
			dropdown.close_menu(uE.$widget[0],uE,e);
			dropdown.to_mode_change(uE.$widget[0],'select',uE,e);
			dropdown.select_value(uE.$widget,
	    			$selected.attr('data-value'),$selected.attr('data-display'));
		});
	};
	dropdown.clickable = '<a class="downArrow closed" tabindex="-1"></a>';
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
		//$tag.append(utils.custom._input(obj));
		dropdown.setAttributes($tag,obj);
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
		$tag.append($dd+dropdown.clickable);	
		return $tag;
	};
	dropdown.isTargetDisplay = function(e) {
        return (e.target.nodeName.toUpperCase() == 'INPUT' && e.target.className.indexOf('display') != -1)
    }
    dropdown.open_menu = function(elem,uE,e){
    	if(!isMenuOpen){
    		$dropDownWidget = uE.$widget || e.$widget || $(elem);
    		$display = $("input.display", elem);
    		$dropDownMenu = $(".dropdown_menu", elem);
    		$dropDownOptions = $(".option", $dropDownMenu);
    		$dropDownMenu.removeClass('dn');
    		$parentMenu = $dropDownMenu;
    		isMenuOpen = true;
    	}
    };
    dropdown.close_menu = function(elem,uE,e){
    	if(isMenuOpen){
    		$dropDownMenu.addClass('dn');
    		$dropDownOptions.removeClass('focus');
    		$('li',$dropDownMenu).removeClass('pfocus focus')
    		$dropDownWidget = null;
    		$display = null;
    		$dropDownMenu = null;
    		$dropDownOptions = null;
    		$parentMenu = null;
    		isMenuOpen = false;
    	}
    };
    dropdown.on_focus = function(elem, uE, e) {
        inputBoxEditing = dropdown.isTargetDisplay(e);
        if (uE.mode == 'edit') {
            return uE.mode
        } else
            return 'select';
    }
    dropdown.on_blur = function(elem, uE, e) {
        inputBoxEditing = !dropdown.isTargetDisplay(e);
        if (uE.mode == 'edit' && inputBoxEditing) {
            return uE.mode
        } else if(uE.mode == 'edit' && dropDownHover){
        	return uE.mode;
        }
        return 'none';
    }
    dropdown.on_keydown = function(elem, uE, e) {
    	if(utils.is.enter(uE.key)){
    		if(uE.mode == 'edit'){
    			dropdown.select_focused(elem, uE, e);
    		} else {
    			dropdown.open_menu(elem, uE, e); return 'edit';
    		}
    		uE.key = utils.is.down(); return 'select';
        } else if (uE.mode == 'select' && !utils.is.nav(uE.key)) {
        	dropdown.on_search(elem, uE, e)
        	return 'edit';
        } else if(uE.mode == 'edit'){
        	dropdown.on_search(elem, uE, e)
        	return 'edit';
        }
        return uE.mode;
    };
    dropdown.on_modechange = function(elem,uE,e){
    	if(uE.mode=='edit'){
    		$("input.display", elem).focusin().select();
    		dropdown.open_menu(elem,uE,e);
    	} else if(uE.mode=='none'){
    		dropdown.close_menu(elem,uE,e)
    	} else if(uE.mode=='select' && uE._mode=='edit'){
    		dropdown.close_menu(elem,uE,e)
    	}
    };
    dropdown.on_search = function(elem,uE,e){
    	if(utils.is.nav(uE.key)){
    		if(isMenuOpen)
    			dropdown.on_navigate(elem,uE,e)
    	} else {
    		uE.props.search = elem.getAttribute('search');
    		if(uE.props.search!='shortcut'){
            	utils.execute.once(function(a,b,c){
            		if(isMenuOpen){
            			dropdown._on_search(elem,uE,e);
            		}
            	}.bind(this))
    		}
    	}
    };
    dropdown.on_navigate = function(elem,uE,e){
    	var $li =  $('li',$parentMenu);
		var $now = $li.filter('.focus');
		$li.removeClass('focus pfocus')
		//$dropDownOptions.removeClass('focus pfocus');
		var $next = $now;
		var count = 0;
		if(utils.is.down(uE.key)){
			do{ $next= $next.next();} 
			while($next.hasClass('disabled') || $next.hasClass('dn'));
		} else if(utils.is.up(uE.key)){
			do{ $next= $next.prev();} 
			while($next.hasClass('disabled') || $next.hasClass('dn'));
		} else if(utils.is.right(uE.key)){
			$next = $("li:not(.dn):eq(0)", $now);
			if($next.length){
				$now.addClass('pfocus').removeClass('focus');
				$parentMenu = $next.parent();
			} else $next = $now;
		} else if(utils.is.left(uE.key)){
			$next = $next.parents('.subMenu');
			if($next.length){
				$next.removeClass('pfocus').addClass('focus');
				$parentMenu = $next.parent();
			}
		}
		if($next.length==0){
			if(utils.is.up(uE.key)){
				$next = $("li:not(.dn):not(.disabled)",$parentMenu).last();
			} else $next = $("li:not(.dn):not(.disabled):eq(0)",$parentMenu);
		}
		$next.addClass('focus');
		uE.stop(e);
    } 

    dropdown.select_focused = function(elem,uE,e){
    	uE.$widget || $(elem);
    	var search = uE.props.search || elem.getAttribute('search');
    	var $selected
    	if(search=='shortcut'){
    		$selected = $dropDownOptions.filter("[shortcut='"+$display.val().toUpperCase()+"']");
    	} 
    	if($selected==null || $selected.length==0){
    		$selected = $dropDownOptions.filter(".focus");
    	}
    	if($selected==null || $selected.length==0){
    		$selected = $dropDownMenu.find(".option.focus");
    	}
    	if($selected==null || $selected.length==0){
    		$selected = $("li.option:not(.dn):not(.disabled):eq(0)",$parentMenu);
    	}
    	return dropdown.select_value(uE.$widget,
    			$selected.attr('data-value'),$selected.attr('data-display'));
    };
    dropdown.select_value = function($widget,iVal,dVal,trigger){
    	$(".display", $widget).val(dVal).text(dVal);
    	utils.custom.iVal($widget, new utils.format.defMap(iVal,dVal),trigger);
    };
    dropdown.setValue = function($widget, iVal, validate,trigger, _dVal){
    	var dVal = _dVal;
		if((iVal=="") && $widget.hasClass("emptyallowed")){ 
			dVal  = ""; iVal  = "";
		} else {
			var $sel = $("li.option[data-value='"+iVal+"']",$widget);
			if($sel && $sel.length){
				dVal  = $sel.attr("data-display");
				iVal  = $sel.attr("data-value");
			} else if($widget.hasClass("anythingallowed") && !dVal){ 
				//TODO:-@poonam this logic to be changed here, cannot have application specific code in widget or any utility
				var values = iVal.split("_");
				dVal = "";
				for(var i = 1; i < values.length; i++)
					dVal += " " + values[i];
				dVal += "(" + values[0].toUpperCase() + ")";
			} else if($widget.hasClass("customtokeninput")){
				dVal = iVal;
			} else {
				$sel = $("li.option:not(.dn):not(.disabled):eq(0)",$widget);
				dVal  = $sel.attr("data-display");
				iVal  = $sel.attr("data-value");
			}
		}
		return dropdown.select_value($widget,iVal,dVal,trigger);
    };
    dropdown._on_search = function(elem,uE,e){
    	var dVal = ($display.val() || '').toLowerCase(); var key = uE.key;
    	var search = uE.props.search || elem.getAttribute('search');
    	var queryString = uE.props.query || elem.getAttribute('query');
    	if(queryString){
    		var tokenURL = uE.props.tokenURL || elem.getAttribute('tokenURL');
    		var method = uE.props.method || elem.getAttribute('method');
    		var cache = uE.props.cached || (elem.getAttribute('cached')=='true');
    		if(!tokenURL && queryString.indexOf('?')!=-1){
    			tokenURL = queryString.split('?')[0];
    			queryString = queryString.split('?')[1];
    		} 
			var query = {
					q : dVal,
					c : $display.getCursorPosition(),
					showExp : uE.props.showExp || elem.getAttribute("showExp"),
					validTokens : uE.props.validTokens || elem.getAttribute("validTokens")
			};
			var _query = queryString.split("&");
			for(var i in _query){
				var keyval = _query[i].split("=");
				query[keyval[0]] = keyval[1];
			}
			utils.getJSON(tokenURL,function(resp){
				dropdown.populateDropDownMenu($dropDownMenu,resp);
			},query,{cache : false, type : e.method, error400 :  e.error400});
    	} else {
    		$dropDownOptions.each(function(e,elem){
        		var _dVal = elem.getAttribute('data-display').toLowerCase();
        		var _iVal = elem.getAttribute('data-value').toLowerCase();
        		if(search=="startsWith" && _dVal.indexOf(dVal) == 0){
        			$(elem).removeClass('dn');
        		} else if(_dVal.indexOf(dVal) != -1){
        			$(elem).removeClass('dn');
        		} else if(_iVal.indexOf(dVal) != -1){
        			$(elem).removeClass('dn');
        		} else {
        			$(elem).addClass('dn');
        		}
        	});
    	}
    	if(!$dropDownMenu.removeClass('upSide downSide').addClass('downSide').visible()){
    		if(!$dropDownMenu.removeClass('downSide').addClass('upSide').visible()){
    			$dropDownMenu.removeClass('upSide').addClass('downSide')
    		}
    	};
    }
    
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
	dropdown.populateDropDownMenu2 = function($dd,options,obj){
		$dd.empty();
		if(!obj) var obj = {}
		for(var i in options){
			var option = options[i];
			if(typeof(options[i])=='object'){
				if(option.subMenu){
					var $li = (new utils.custom.dom('li')).addClass('subMenu').attr('title',option.label).append(option.label);
					var $ul = (new utils.custom.dom('ul'));
					dropdown.populateDropDownMenu2($ul,option.subMenu,obj);
					$dd.append($li.append($ul.toString()).toString());
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
	dropdown.setParams = function($this,params){
		var $dd = $(".dropdown_menu",$this);
		var first = utils.custom.dropdown.populateDropDownMenu2($dd,params.options);
		if(params.value==undefined) params.value = first;
		if($this.hasClass("anythingallowed")){
			utils.custom.iVal($this, new utils.format.defMap(params.value,params.dispVal));
			//dropdown.setValue($this,params.value, undefined, params.dispVal);
		}else {
			utils.custom.iVal($this, new utils.format.defMap(params.value));
			//dropdown.setValue($this,params.value);
		}
	};
	dropdown.dropDownMenu = function(options,obj){
		var $dd = new utils.custom.dom('ul');
		$dd.addClass("dropdown_menu dn");
		if(options)
			dropdown.populateDropDownMenu2($dd,options,obj);
		return $dd;
	};
	dropdown.populateDropDownMenu = function($dd,resp){
		if(!$dd) return;
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
	$.fn.onIconClick = function(cb){
		$(".dropdown_menu", this).change(cb);
	};
});

utils.custom.defineWidget("toggleinput").from('dropdown').as(function(toggleinput){
	toggleinput.clickable = ''; 
	utils.custom.on(".tagwrapper .xtoggle","click", function(e){
		console.log('xtogfrle...ewewewew',e)
		var $wrapper = $(this).parents(".tagwrapper");
		toggleinput.inputToggle($(".tag:not(.readOnly)",$wrapper));
	});
	utils.custom.on(".tagwrapper .xtoggle", "keyup", function(e){
		var $wrapper = $(this).parents(".tagwrapper");
		var k = (e.keyCode || e.which);
		if(k==13) toggleinput.inputToggle($(".tag:not(.readOnly)",$wrapper));
	});
	toggleinput.override('tag',function(obj){
		var $tag = this['super'].tag(obj);
		var tagWrapper = new utils.custom.dom('div').addClass('tagwrapper');
		tagWrapper.append($tag+'<div tabindex="0.1" class="right_position tgl_btn btntgl xtoggle"></div>');
		return tagWrapper;
	});
	toggleinput.inputToggle = function($this){
		var $disp = $(".display",$this);
		var cur = $disp.val();
		if(cur) cur = toggleinput.getCur(cur, true) ; else return;
		$disp.val(cur.dispVal).text(cur.dispVal)
		utils.custom.iVal($this, new utils.format.defMap(cur.value,cur.dispVal));
	};
	toggleinput.filterCurString = function(key){
		return key.toUpperCase().replace(/[ \/\\]/gi, "");
	}
	toggleinput.curDSign = '*';
	toggleinput.curISign = 'NDF';
	toggleinput.getCur = function(input, reverse){
		var value = toggleinput.filterCurString(input);
		
		var NDF = false;
		if(value.indexOf(toggleinput.curDSign)!=-1 || value.indexOf(toggleinput.curISign)!=-1 ){
			NDF = true;
			value = value.replace(toggleinput.curDSign,'').replace(toggleinput.curISign,'');
		}
		var assetCur = value.substr(0,3);
		var numerCur =  value.substr(3,3);
		var dispVal = assetCur + " / " + numerCur;
		if(reverse){
			dispVal = numerCur + " / " + assetCur;
			value = numerCur + assetCur;
		}
		return { dispVal : dispVal + (NDF ? toggleinput.curDSign : '') , value : value + (NDF ? dropdown.curISign : '')};
	};
});

utils.custom.defineWidget("tokeninput").as(function(tokeninput){
	
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
						if(!e.prevent) utils.custom.execute($widget, {});
					},
					onDelete : function(e){
						utils.custom.execute($widget, {},function(e){
							$("input.value:not(.preventOnchnage)",e.$widget).change();							
						});
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
