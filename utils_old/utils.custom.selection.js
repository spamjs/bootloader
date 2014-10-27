select_namespace("utils.custom.stripbar", function(stripbar){

	stripbar.init = function(){
		$("body").delegate(".tag.stripbar .optionValue", "click", function(e){		
			var $thisOption = $(this);
			var $widgetDiv = $thisOption.parents(".tag");
			//var selVal = $("input.optionValue", $thisOption).val();
			var selVal = $thisOption.val();
			 $("input.value", $widgetDiv).val(selVal);
			stripbar.onChange($widgetDiv);
		});
		$("body").delegate(".tag.stripbar .headerbutton:not(.disabled)", "click", function(e){		
			var $thisOption = $(this);
			var $widgetDiv = $thisOption.parents(".tag");
			//if($thisOption.hasClass("disabled")) return;
			 $(".headerbutton",$widgetDiv).change();
		});
		$("body").delegate(".tag.stripbar .stripsearch", "keyup", function(e){
			var $thisOption = $(this);
			var val = $thisOption.val();
			val = val.toLowerCase();
			var searchClause = $thisOption.attr("searchClause");
			var $parent = $thisOption.parents(".stripbar");
			if($parent.hasClass("toggleinput") && val.length > 3){
				val = val.replace(/\ /g, '');
				val = (val.indexOf("/") == -1) ? val.substr(0, 3) + "/" + val.substr(3) : val;
			}
			$(".striplist .striprow", $parent).each(function(key, value){
				$this = $(this);
				var actual;
				actual = $(".stripelemname", $this).text();
				actual = actual.toLowerCase();
				if(searchClause != undefined && searchClause.indexOf("startsWith") == 0){
					if(actual.indexOf(val) != 0)
						$this.addClass("dn");
					else
						$this.removeClass("dn");
				}else{
					if(actual.indexOf(val) == -1)
						$this.addClass("dn");
					else
						$this.removeClass("dn");
				}
			});
		});
		$.fn.onHeaderClick = function(cb){
			var $widgetDiv = $(this);
			$(".headerbutton",$widgetDiv).change(function(e){
				cb(e,$widgetDiv);
			})
		};
		$.fn.disableHeaderClick = function(set){
			var $widgetDiv = $(this);
			if(set===undefined || set==true){
				$(".headerbutton",$widgetDiv).addClass("disabled");
			} else $(".headerbutton",$widgetDiv).removeClass("disabled");
		};
		$.fn.appendOption = function(iVal, dVal,sel){
			stripbar.addOptions($widget,iVal, dVal,sel);
		}
		$.fn.prependOption = function(iVal, dVal,sel){
			stripbar.addOptions(null,iVal, dVal,sel,true);
		}
	};
	stripbar.setSlimScroll = function($widget,options){
		$(".striplist.options",$widget).slimScroll(options);
	};
	stripbar.setValue = function($widget, value){
		var $opt = $(".option input.optionValue[data-value='"+value+"']", $widget);
		if($opt.length){
			$opt[0].checked = true;
			$("input.value", $widget).val(value);
		}
	};
	stripbar.setParams = function($widget, params){
		$(".options",$widget).empty();
		if(params.header)
			$(".userrow.header input.buttonuser",$widget).val(params.header);
		var sel = true;
		if(params.sel != undefined)	sel = params.sel;
		for(var i in params.options){
			if(params.options[i].id != undefined)
				stripbar.addOptions($widget,params.options[i].id, params.options[i].name, sel, undefined, params.name);
			else
				stripbar.addOptions($widget,i,params.options[i],sel, undefined, params.name);
			sel = false;
		}
		 $("input.value", $widget).val(params.value);
	};
	stripbar.addOptions = function($widget,iVal, dVal,sel,prepend, radioName){
		if(!radioName) radioName = "checkbox1";
		var $opt = '<div class="striprow option"><div class="stripelement td">';
		$opt = $opt+ '<div class="stripelemradio"><input type="radio" data-value="'+iVal+'" value="' + iVal;
		if(sel) $opt = $opt+ '" checked="checked"';
		$opt = $opt+ '" class="optionValue" name="' + radioName + '"></div>';
		$opt = $opt+ '<div class="stripelemname"><span title="' + dVal +'">'+dVal+'</span></div></div></div>';
		if(prepend)
			$(".options", $widget).prepend($opt);
		else 
			$(".options", $widget).append($opt);
	};
	stripbar.onChange = function(elem, cb){
		var $widgetDiv = $(elem);
		if(cb==undefined){
			return  $("input.value", $widgetDiv).change();
		}
		$widgetDiv.addClass("onchange");
		return 	$("input.value", $widgetDiv).change(function(e){
	    	var $thisWidget = $(this).parent(".tag");
	    	if($thisWidget.hasClass("readOnly") && $thisWidget.hasClass("yes")) return;
	        if(cb) cb(e,$thisWidget);
		});	
	};
});

select_namespace("utils.custom.tabs", function(tabs){
	/*
	<article class="dfftabs" data-maxTab=4>
		<section class="tab a">
			<h3 class="title" data-value="a">A</h3>
			<div class="tabContent">
				CONTENT
			</div>
			</section>
	</article>*/
	$.fn.dragDrop = function(){
		this.draggable({
			//revert : 'invalid',
			zIndex: 1000,
			axis : 'x',
			helper : 'clone',
			opacity : 0.1
		})
		this.droppable({
			accept : '.tab .title',
			over : function(a,b,c){
				var thisSection = $(this).parents('section.tab');
				var drggaedSection = b.draggable.parents('section.tab');
				var diff = thisSection.index()-drggaedSection.index();
				if(diff>0)thisSection.after(drggaedSection);
				else thisSection.before(drggaedSection);
				b.draggable.attr('style','position:relative');
				//b.draggable.css('left',-50);
			},
			drop : function(a,b,c){
				b.draggable.attr('style','position:relative');
			}
		})
	}
	$.fn.initTab = function(obj){
		var $TABS = $(this);
		var $inputs = $(".inputDiv",$TABS);
		if(!obj) var obj = {};
		if(obj.events){
			for(var event in obj.events){
				var $input = $('input.'+event,$inputs);
				if(!$input.length){
					$input = $('<input class="value '+event+'" type="hidden" value="0" />')
					$inputs.append($input);
				}
				$input.change(obj.events[event]);
			}
		}
		$("section.tab .title",$TABS).dragDrop();
	}
	$.fn.selectNextTab = function(dir){
		if(dir==undefined) var dir = 1;
		var fun = 'next';
		if(dir==-1) fun = "prev";
		var $section = $(this)
		var $tab;
		if(dir==0){
			$tab = $(".tab:not(.voidTab):eq(0)", $section);
			return $tab.find('.title').click();
		} else{
			$tab = $(".tab.selectedtab", $section);
			if($tab && $tab.length==0){
				$tab = $(".tab:eq(0)", $section);
			}
			var $nextTab = $tab[fun]('.tab');
			while($nextTab.length && $nextTab.hasClass('voidTab')) $nextTab =  $nextTab[fun]('.tab');
			if($nextTab && $nextTab.length){
				if($nextTab.hasClass('tab') && !$nextTab.hasClass('voidTab')){
					var value = $nextTab.attr('tabID');
					tabs.selectTab($section,value,dir);
				}// else $nextTab = $tab[fun]();
			}
		}
	}
	$.fn.selectTab = function(value, fName, fValue, dir){
		var $this = $(this);
		var $input =  $('input.tabchange',$this);
		if(value==undefined) var value = $input.val();
		var $tab = $(".tab[tabID='"+value+"']",$this);
		if($tab.hasClass('voidTab')){
			return false;
		}
		if(fName==undefined){
			var $tabs = $(".tab:not(.voidTab)",$this);
			$(".tab .tabContent",$this).addClass('dn');
			$(".tabContent",$tab).removeClass('dn');
			var allTabLength = $(".tab",$this).removeClass('selectedtab current').length;
			$tab.addClass('selectedtab current');//.removeClass('dn');
			$input.val(value);
			var limit = $this.attr('tabSize')-1;
			if(isNaN(limit)) limit = 2;
			if($tab.hasClass('dn') || $(".tab:not(.dn)",$this).length<=limit && utils.isFinite(limit)){
				$tabs.addClass('dn');
				var fun = 'prev';
				if(dir==-1) fun = "next";
				var $next = $tab;
				$next.removeClass('dn')
				var k = 0;
				//$next = $next[fun+'All'](".tab:not(.voidTab)");
				for(var i=0;i<allTabLength;i++){
					$next = $next[fun]();
					if(k<limit && $next.hasClass('tab') && !$next.hasClass('voidTab')){
						$next.removeClass('dn');k++;
					}
 				}
				fun = (fun=='next'?'prev':'next');
				$next = $tab;
				for(var i=k;i<allTabLength;i++){
					$next = $next[fun]();
					if(k<limit && $next.hasClass('tab') && !$next.hasClass('voidTab')){
						$next.removeClass('dn');k++;
					} //else limit++;
				}
			}
			$this.removeClass('HASprev HASnext');
			if($tab['nextAll']('.tab:not(.voidTab)').length>0){
				$this.addClass('HASnext');
			};
			if($tab['prevAll']('.tab:not(.voidTab)').length>0){
				$this.addClass('HASprev');
			};
		} else {
			if($tab[fName]) $tab[fName](fValue);
		}
		return $tab;
	};
	$.fn.removeTab = function(value){
		var $section = $(this);
		var $tab = $(".tab[tabID='"+value+"']", $section);
		var $prev = $tab.prev('.tab');
		$tab.remove();
		if($tab.hasClass('selectedtab') || $tab.hasClass('current')){
			//$('input.tabchange',$section).val('');
			if(!$prev.length){
				$prev = $(".tab .title:eq(0)", $section);
			}
			if($prev.length) tabs.titleOnClick($section,$(".title", $prev));
		} else {
			this.selectTab();
		}
		$('input.tabclose',$section).change();
	};
	$.fn.addTab = function(obj){
		var $tab = $(".tab[tabID='"+obj.value+"']", $(this));
		if(!$tab.length){
			if(!obj.$title) obj.$title = obj.title;
			obj.$header = $('<h3 class="title" data-value="'+obj.value+'" tab="'+obj.value+'" ></h3>').append(obj.$title);
			obj.$header.dragDrop();
			obj.$section = $('<section class="tab dn '+obj.tabClass+'" tabID="'+obj.value+'"></section>');
			$(this).append(
					obj.$section.append(obj.$header).append(
					$('<div class="tabContent dn"></div>').append(obj.$content)	
			));
			if(obj.events){
				obj.events();
			}
		}
		return $tab;
	};
	$.fn.setTabAttr = function(attrName,attrValue){
		if(attrName=='tabSize'){
			this.attr('tabSize',attrValue);
			$(".tab:not(.voidTab)",this).addClass('dn');
			this.selectTab();
		}
	};
	tabs.selectTab = function($tabContainer,value,dir,trigger){
		var $tabchange = $('input.tabchange',$tabContainer);
		var val = $tabchange.val();
		//$tabchange.val(value)
		$tabContainer.selectTab(value,undefined,undefined,dir);
		//if(value!=val) $tabchange.change();
		//tabs.setValue($tabContainer,value,true);
		if(trigger || ((""+value)!=(""+val))) $tabchange.change();
	} 
	tabs.titleOnClick = function($tabContainer,$title,e){
		var $tabContainer = $tabContainer || $title.parents('.dfftabs');
		var value = $title.attr('data-value');
		tabs.selectTab($tabContainer,value);
	}
	tabs.init = function(){
		$("body").delegate(".dfftabs .title", "click", function(e){
			tabs.titleOnClick(undefined,$(this),e)
		});
	}
})

select_namespace("utils.custom.selection", function(selection){

	selection.init = function(){
		$("body").delegate(".tabstrip.tag .option, .radiostrip.tag .option", "click", function(){
			var $option = $(this);
			if($("input[type='radio']", $option).attr("disabled") == undefined){
				var $widgetDiv = $option.parents(".tag");
				selection.selectOption($widgetDiv,$option);
				return;
			}
		});
		$("body").delegate(".tabstrip.tag .leftArrow","click", function(){
			var $widget = $(this).parents(".tag");
			var limitIndex = $("input.value",$widget).attr("limitindex")-1;
			if(isNaN(limitIndex)) limitIndex = 0;
			if(limitIndex<0) limitIndex=0;
			selection.shiftSet($widget,limitIndex);
		});
		$("body").delegate(".tabstrip.tag .rightArrow","click", function(){
			var $widget = $(this).parents(".tag");
			var limitIndex = $("input.value",$widget).attr("limitindex")-1+2;
			if(isNaN(limitIndex)) limitIndex = 0;
			if(limitIndex<0) limitIndex=0;
			selection.shiftSet($widget,limitIndex);
		});
	};
	selection.selectOption = function($widget, $option){
		$(".option",$widget).removeClass('selected');
		$(".option input",$widget).attr("checked",false);
		$option.addClass('selected');
		$(".option.selected input",$widget).attr("checked",true);
		$widget.curVal =$option.attr('index');
		$("input.value", $widget).val($widget.curVal);
    	$("input.value", $widget).attr("old-value", $widget.curVal);
	};
	
	selection.setValue = function($widget,value){
		var $option = $(".option[index='"+value+"']", $widget);
		return selection.selectOption($widget,$option);
	};
	selection.shiftSet = function($widget,limitIndex){
		if(limitIndex<0) return;
		var $total = $(".option",$widget);
		var total = $total.length;
		var $always = $(".option.always",$widget);
		var always = $always.length;
		var limit = $widget.attr("limit")-0-always;
		if(limitIndex>(total-limit-always)) return;
		$total.addClass("dn");
		if(isNaN(limitIndex)) limitIndex = 0;
		limitIndex = limitIndex-0; 
		for(var i=limitIndex; i<(limit+limitIndex);i++){
			$(".option:eq("+i+")",$widget).removeClass("dn");
		}
		$always.removeClass("dn");
		$("input.value",$widget).attr("limitindex",limitIndex);
	};
	
	selection.setParams = function(_$widget, params){
		_$widget.each(function(i,elem){
			var $widget = $(elem)
			if($widget.hasClass("tabstrip")){
				/*	params = {
						options : { 0 : "1M", 1 : "2M", 3 : "3M"},
						value : "1"
					} */
				var limitIndex = $("input.value",$widget).attr("limitindex");
				if(limitIndex==undefined) limitIndex=0;
				$widget.empty();
				$widget.append("<div class='options'></div>")
				var sel = "selected";
				var tabindex = $widget.addClass('enterOption').attr('tabindex');
				$widget.removeAttr('tabindex');
				if(!tabindex) tabindex = 0;
				for(var i in params.options){
					var index = i;
					var value = params.options[i];
					var always = "";
					if(typeof(value)=='object'){
						index = params.options[i].id;
						value = params.options[i].name;
						if(params.options[i].always) always = "always";
					}
					$(".options",$widget).append('<a tabindex='+ tabindex +' class="option '+sel+' '+always+'" index="'+index+'" >'+value+'</a>');
					sel = '';
				}
				$widget.append('<input type="hidden" class="value" limitindex= '+limitIndex+' value=0 />');
				if(params.limit) {
					$widget.prepend("<div tabindex="+ tabindex +" class='leftArrow'></div>").append("<div tabindex="+ tabindex +" class='rightArrow'></div>");
					$widget.attr("limit",params.limit);
					selection.shiftSet($widget,limitIndex);
				}
			} else if($widget.hasClass("radiostrip")){
				$widget.empty();
				var sel = "checked";
				var index = "";
				for(var i in params.options){
					$widget.append('<div class="option" index="'+i+'"><div class="radio"><input type="radio" '+sel+' value="'+i+'" ></div><div class="label">'+params.options[i]+'</div></div>');
					if(sel) {index= i; sel = ''; }
				}
				$widget.append('<input type="hidden" class="value" value="'+index+'" />'); 
			} 
			if(params.value!==undefined){
				$widget.setValue(params.value);
			}
		})
	};
	
	selection.onChange = function(elem, cb){
		var $widgetDiv = $(elem);
		if(cb==undefined){
			return true;
		}
		$widgetDiv.addClass("onchange");
		return 	$($widgetDiv).delegate(".option", "click", function(e){
			$(".option",$widgetDiv).removeClass('selected');
			$(".option input",$widgetDiv).attr("checked",false);
			$(this).addClass('selected');
			$(".option.selected input",$widgetDiv).attr("checked",true);
			$widgetDiv.oldVal = $("input.value", $widgetDiv).attr("old-value");
			$widgetDiv.curVal =$(this).attr('index');
			$("input.value", $widgetDiv).val($widgetDiv.curVal);
	    	$("input.value", $widgetDiv).attr("old-value", $widgetDiv.curVal);
	    	preventPropagation(e);
	    	e.$widget = $widgetDiv;
	        if($widgetDiv.curVal!=$widgetDiv.oldVal && cb && $widgetDiv.isValid())
	        	cb(e,$widgetDiv);
		});	
	};
});

select_namespace("utils.custom.multiselect", function(multiselect){

	multiselect.init = function(){
		$("body").delegate(".multiselect.tag ul.multiselect_menu li label", "click", function(e){
			var $option = $(this).parents(".option");
			$("input",$option).click();
		});
		$("body").delegate(".multiselect.tag .downArrow", "click", function(){
			var $this = $(this).parents(".tag");
			$(".multiselect_menu", $this).toggleClass("dn").focus();
			
		});
		$("body").delegate(".multiselect.tag .multiselect_menu", "mouseenter", function(){
			$(this).addClass("mouseenter");
		});
		$("body").delegate(".multiselect.tag .multiselect_menu", "mouseleave", function(){
			$(this).removeClass("mouseenter");
		});
		$("body").delegate(".multiselect.tag .multiselect_menu", "blur", function(){
			var $multiselect_menu = $(this)
			if(!$multiselect_menu.hasClass("mouseenter")){
				$multiselect_menu.addClass("dn");
			}
		});
		$("body").delegate(".multiselect.tag li", "click", function(e){
			var $this = $(this);
			var dataValue = $this.attr("data-value");
			var checked = $("input", $this).attr("checked");
			var parent = $this.parents(".tag");
			if(dataValue == "all"){
				if(checked)
					$(".option input", parent).attr("checked", checked);
				else
					$(".option input", parent).removeAttr("checked");
			}else{
				if(checked){
					var all = $(".option", parent);
					var selected = $(".option input:checked", parent);
					if((all.length - 1) == selected.length)
						$(".option[data-value='all'] input", parent).attr("checked", checked);
				}else
					$(".option[data-value='all'] input", parent).removeAttr("checked");
			}
		});
	};

	multiselect.getValue = function($widget, params){
		var retList = [];
		$(".multiselect_menu .option", $($widget)).each(function(i,option){
		    if($("input",$(option))[0].checked){
		        retList.push($(option).attr('data-value'));
		    }
		});
		var index = utils.indexOf(retList, "all");
		if(index != -1)
			retList.splice(index, 1);
		return retList;
	};
	
	multiselect.setValue = function($widget, retList,attr){
		if(!retList) var retList = [];
		$(".multiselect_menu .option input",$widget).each(function(){ this.checked=false;});
		for(var i in retList){
			var $fld = $(".multiselect_menu .option[data-value='"+retList[i]+"'] input:eq(0)", $widget)[0];
			if($fld) $fld.checked = true;
		}
		var all = $(".option", $widget);
		if(retList.length == (all.length - 1))
			$(".option[data-value='all'] input", $widget).attr("checked", "checked");
		return retList;
	};
	
	multiselect.onChange = function(elem, cb){
		var $widgetDiv = $(elem);
		if(cb==undefined){
			return true;
		}
		$widgetDiv.addClass("onchange");
		return 	$($widgetDiv).delegate(".option", "click", function(e){
			$(".option",$widgetDiv).removeClass('selected');
			$(".option input",$widgetDiv).attr("checked",false);
			$(this).addClass('selected');
			$(".option.selected input",$widgetDiv).attr("checked",true);
			$widgetDiv.oldVal = $("input.value", $widgetDiv).attr("old-value");
			$widgetDiv.curVal =$(this).attr('index');
			$("input.value", $widgetDiv).val($widgetDiv.curVal);
	    	$("input.value", $widgetDiv).attr("old-value", $widgetDiv.curVal);
	    	preventPropagation(e);
	        if($widgetDiv.curVal!=$widgetDiv.oldVal && cb && $widgetDiv.isValid())
	        	cb(e,$widgetDiv);
		});	
	};
	$.fn.getMultiSelectValue = function(attr, islist){
		return multiselect.getValue(this,attr,islist);
	};
});

select_namespace("utils.custom.checklistpopup", function(multiselect){
	
	$.fn.checklistpopup = function(obj){
		var $triger = $(this);
		var $offset = $triger.offset();
		var $trigerWidth = $triger.width();
		var $trigerHeight = $triger.height();
		var $title = '';
		obj.ok_lable = obj.ok_lable  || 'Ok'
		if(obj.title){$title = '<div class="title">'+obj.title+'</div>';}
		var $dropdownCheckWidget = $('<div class="dropdownCheckWedget" style='+obj.style+' tabindex=-1>'+$title+'<div class="prevent" tabindex=-1></div><div class="scrollMe"><div class="checkBox"><input type="checkbox"> <span>1D</span></div></div><div class="okButton bottomMar"><input value="'+obj.ok_lable+'" class="button  submit " name="input4" type="button"></div></div>');
		obj.$parent.append($dropdownCheckWidget);
		if(obj.left==undefined){
			obj.left = $offset.left+$trigerWidth;
			(obj.minLeft==undefined) || ( obj.left = Math.max(obj.left,obj.minLeft));
		}
		$dropdownCheckWidget.css("left", obj.left);
		$dropdownCheckWidget.css("top", $offset.top+$trigerHeight);
		
		$dropdownCheckWidget.focus();
		$dropdownCheckWidget.close = function(){
			$dropdownCheckWidget.remove();
			$dropdownCheckWidget = null;
		};
		if(obj.slimScroll)
			$(".scrollMe", $dropdownCheckWidget).slimScroll(obj.slimScroll);

		$(".checkBox",$dropdownCheckWidget).remove();
		for(var i in obj.data.key){
			var link = (obj.onClick) ? ('<a class="clickable" value="'+obj.data.key[i]+'">'+obj.data.display[i]+'</a>') : obj.data.display[i];
			$(".scrollMe",$dropdownCheckWidget).append('<div class="checkBox _'+obj.data.key[i]+'"><input type="checkbox" value="'+obj.data.key[i]
			+'"> <span>'+link+'</span></div>');
		}
		for(var i in obj.data.selectedKey){
			var $check = $(".checkBox._"+obj.data.selectedKey[i]+" input",$dropdownCheckWidget);
			if($check.length)$check[0].checked = true;
		}
		$dropdownCheckWidget.append($(".okButton",$dropdownCheckWidget));
		if(obj.onClick){
			$("a.clickable",$dropdownCheckWidget).click(function(e){
				var val = $(this).attr('value');
				var close = true;
				if(obj.onClick){
					close = obj.onClick(val)
				}
				if(close==undefined || close===true) $dropdownCheckWidget.close();
			});
		}
		$(".submit",$dropdownCheckWidget).click(function(e){
			var retList = [];
			if(!obj.data.selected) obj.data.selected = [];
			$(".checkBox", $dropdownCheckWidget).each(function(i,option){
			    if($("input",$(option))[0].checked){
			        retList.push($("input",$(option)).val());
			        obj.data.selected[i] = true;
			    } else obj.data.selected[i] = false;
			});
			obj.data.shortlist = retList;
			var close = obj.onSubmit(obj.data);
			if(close==undefined || close===true) $dropdownCheckWidget.close();
		});
		$dropdownCheckWidget.click(function(){
			$dropdownCheckWidget.focus();
		})
		$dropdownCheckWidget.mouseenter(function(){
			$dropdownCheckWidget.addClass("mouseenter");
		});
		$dropdownCheckWidget.mouseleave(function(){
			$dropdownCheckWidget.removeClass("mouseenter");
		});
		$dropdownCheckWidget.blur(function(){
			if(!$dropdownCheckWidget.hasClass("mouseenter"))
				$dropdownCheckWidget.close();
		});
	};
	
});

select_namespace("utils.custom.listselector", function(listselector){
	
	listselector.show = function(obj){
		var $masterTitle = (obj.masterTitle) ? ('<div class="title">'+obj.masterTitle+'</div>') : '' ;
		var $selectedTitle = (obj.selectedTitle) ? ('<div class="title">'+obj.selectedTitle+'</div>') : '';

		var wrapper = '<div style=" " tabindex=-1 class="listselector">'
				+ '<div class="master">'+$masterTitle+'<div name="available_columns" class="select available_columns" size="8" multiple="multiple">';
		for(var i in obj.data.key){
			wrapper = wrapper + '<div class="option" value="'+obj.data.key[i]+'">'+obj.data.display[i]+' <i /></div>';
		}	
		wrapper = wrapper + '</div></div>'
		+ '<div class="selected">'+$selectedTitle+'<div name="selected_columns" class="select selected_columns" size="8" multiple="multiple"></div></div>'
		+'</div>';
		var $wrapper = $(wrapper);
		obj.parent.append($wrapper);
		for(var i in obj.data.selectedKey){
			listselector.select ($wrapper,obj.data.selectedKey[i])
		}
/*		$( ".select.available_columns" ).sortable({
			connectWith: ".select.selected_columns"
		});*/
		$( ".select.selected_columns,.select.available_columns" ).sortable({
			connectWith: ".select.available_columns",
			remove : function(){
				if($(this).is(':empty')){
					$(this).sortable('cancel');
				}
			} 
		});
		
		$('.selected_columns', $wrapper).delegate('.option i', 'click',function(e){
			if(!obj.atleastOne || $('.selected_columns .option', $wrapper).length>1)
				listselector.deselect ($wrapper,$(this).parent().attr('value'));
		});
		$('.available_columns', $wrapper).delegate('.option i', 'click',function(e){
			listselector.select ($wrapper,$(this).parent().attr('value'));
		});
		return $wrapper;
	};
	listselector.select = function($wrapper,value){
		var $val = $('.available_columns .option[value="'+value+'"]', $wrapper);
		$(".select.selected_columns", $wrapper).append($val);
	};
	listselector.deselect = function($wrapper,value){
		var $val = $('.selected_columns .option[value="'+value+'"]', $wrapper);
		$(".select.available_columns", $wrapper).append($val);
	};
	
	listselector.updateView = function () {
	    var select_button = document.getElementById("select_button");
	    var deselect_button = document.getElementById("deselect_button");
	    var up_button = document.getElementById("up_button");
	    var down_button = document.getElementById("down_button");
	    select_button.disabled = true;
	    deselect_button.disabled = true;
	    up_button.disabled = true;
	    down_button.disabled = true;
	    var av_select = document.getElementById("available_columns");
	    var sel_select = document.getElementById("selected_columns");
	    for (var i = 0; i < av_select.options.length;  i++) {
	        if (av_select.options[i].selected) {
	            select_button.disabled = false;
	            break;
	        }
	    }
	    for (var i = 0; i < sel_select.options.length; i++) {
	        if (sel_select.options[i].selected) {
	            deselect_button.disabled = false;
	            up_button.disabled = false;
	            down_button.disabled = false;
	            break;
	        }
	    }
	    if (sel_select.options.length > 0) {
	        if (sel_select.options[0].selected) {
	            up_button.disabled = true;
	        }
	        if (sel_select.options[sel_select.options.length - 1].selected) {
	            down_button.disabled = true;
	        }
	    }
	}
});

select_namespace("utils.custom.contextmenu", function(contextmenu){
	
	contextmenu.init = function(){
		this.$MENU = $('<div style="display:none; " tabindex=-1 id="contextMenu" class="mouseleave"></div>');
		$('body').append(this.$MENU);
		this.$MENU[0].onmouseenter = function(e){
			contextmenu.$MENU.addClass('mouseenter');
			contextmenu.$MENU.removeClass('mouseleave');
		};
		this.$MENU[0].onmouseleave = function(e){
			contextmenu.$MENU.addClass('mouseleave');
			contextmenu.$MENU.removeClass('mouseenter');
		};
		this.$MENU[0].onblur = function(e){
			if(contextmenu.$MENU.hasClass('mouseleave'))
				contextmenu.hide ()
		};
		this.$MENU.delegate(".ContextItem", 'click', function(e){
			if(contextmenu.onclick){
				e.action = this.id;
				contextmenu.onclick(e)
				contextmenu.hide();
			}
		});
	}
	contextmenu.hide = function(){
		this.$MENU[0].style.display = 'none';
	}
	contextmenu.show = function(e,obj){
		var _div = '<table  border="0" cellpadding="0" cellspacing="0" '
		+'style="border: thin solid #808080; cursor: default;position:absolute; display:inline;z-index:100000000000000" width="130" bgcolor="White">';
		for(var i in obj.data.key){
			_div = _div + '<tr><td><div id="'+obj.data.key+'" class="ContextItem">'+obj.data.display[i]+'</div></td></tr>';
		}
		_div = _div + '</table>';
		this.$MENU.html(_div);
		var posx = e.clientX +window.pageXOffset +'px'; //Left Position of Mouse Pointer
        var posy = e.clientY + window.pageYOffset + 'px'; //Top Position of Mouse Pointer
        this.$MENU[0].style.position = 'absolute';
        this.$MENU[0].style.display = 'inline';
        this.$MENU[0].style.left = posx;
        this.$MENU[0].style.top = posy;
        this.$MENU[0].focus();
        this.onclick = obj.onclick;
	};
});

select_namespace("utils.custom.searchables", function(searchables){
	searchables.init = function(){
		//
	}
	
	$.fn.makeSearchable = function(obj){
		var $widgetTable = this;
		$widgetTable.delegate(".makeSearchable", "keyup", function(e){
			var $thisOption = $(this);
			var val = $thisOption.val();
			val = val.toLowerCase();
			var searchClause = $thisOption.attr("searchClause");
			$(".seachbleRow", $widgetTable).each(function(){
				var $this = $(this);
				var actual;
				actual = $this.attr('title');
				actual = actual.toLowerCase();
				if(actual.indexOf(val) == -1)
					$this.addClass("dn");
				else
					$this.removeClass("dn");
			});
		});
	}
});

select_namespace("utils.custom.collapsibleTab", function(collapsibleTab){
	/*
	 * <div class="collapsibleTab">
	 * 		<div><a class="title">TITLE</a></div>
	 * 		<div collapsibleSec="true" class="dn"></div>
	 * </div>
	 */
	$('body').delegate(".collapsibleTab a.title",'click',function(e){
		var $this = $(this);
		var $parent = $this.parents(".collapsibleTab");
		$parent.toggleClass("active");
	});
});