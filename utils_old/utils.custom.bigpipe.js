select_namespace("utils.custom.popup", function(_popup){
	
	_popup.windowCount = 0;
	_popup.windows = {};
	_popup.init = function(){
		_popup.$popupCache = $(".popups");
		_popup.$popupTrash = $(".popups");
	};
	
	$.fn.dffPopup = function(popup,cb){
		var selector = this.selector;
		popup.cache = (popup.cache!==undefined ? popup.cache : true);
		if((popup.cache && this.length==0) || !popup.cache){
        	bigpipe.loadPopup({
	    		parent :  _popup.$popupCache,
	    		popup : popup.popup,
	    		success : function(repHTML){
	    			var $html = $(".popup.wrapper",$(repHTML));
	    			_popup.onHTMLReady($(selector+":eq(0)"), popup);
	    			if(!popup.cache) $(selector).remove();
	    		}
	    	});
		} else {
			_popup.onHTMLReady(this, popup)
		}
		return popup;
	};
	
	_popup.onHTMLReady = function($HTML, popup){
		if(popup.beforeload){
			popup.show = function(options){
				for(var key in options){
					popup[key] = options[key];
				}
				return _popup.dffPopup($HTML,popup);
			}
			popup.beforeload();
		} else _popup.dffPopup($HTML,popup);
	};
	
	_popup.onHTMLReady2 = function($HTML, popup){
		if(popup.beforeload){
			popup.show = function(options){
				for(var key in options){
					popup[key] = options[key];
				}
				return _popup.dffWindow($HTML,popup);
			}
			popup.beforeload();
		} else _popup.dffWindow($HTML,popup);
	};
	
	$.fn.dffWindow = function(popup,id){
		if(popup==undefined) return _popup.windows[id];
		if(!popup.$parentDiv) popup.$parentDiv = $("body");
		if(popup.background===undefined || popup.background){
			popup.$overlayDiv = $(".popups .pp_overlay");
		}
		var selector = this.selector;
		var context = this.context;
		popup.cache = (popup.cache!==undefined ? popup.cache : true);
		if((popup.cache && this.length==0) || !popup.cache){
        	return bigpipe.loadHTML({
	    		parent :  _popup.$popupCache,
	    		HTMLType : "popup",
        		popup : popup.popup,
	    		success : function(html){
	    			var $html = $(".popup.wrapper."+popup.popup,_popup.$popupCache);
	    			_popup.onHTMLReady2($html, popup);
	    			if(!popup.cache) $html.remove();
	    		}
	    	});
		} else {
			_popup.onHTMLReady2(this, popup);
		}
		return popup;
	};
	
	_popup.dffWindow = function($html,popup){
		var iframeID = ++this.windowCount;
		popup.__close = popup.close;
		popup.__iframeID = iframeID;
		popup.close = function(e){
			this.__close(e);
			delete _popup.windows[this.__iframeID];
		}
		var _p = $html.popup(popup);
		_p.$div.attr('id',"dw"+iframeID).attr('tabindex',"-1").addClass("dffWindow");
		_popup.windows[iframeID] = _p;
		
		_p.windowFunction = function(fname,fparam){
			if(this[fname]) this[fname](fparam);
			else if(this.$div[fname])this.$div[fname](fparam);
		}
		if(_p.fadeIn){
			_p.parentDivClass = popup.parentDivClass  + " dn"
		}
		if(_p.parentDivClass){
			_p.$div.addClass(popup.parentDivClass);
		}
		if(_p.left==undefined){
			_p.left = 165;
			_p.resetAlingment = function(){
				var winwidth = $(window).width();
				var winheight = $(window).height();
				var popupleftVal = $(".popup .pp_content", _p.$parentDiv).width()/winwidth *50;
				var popuptopVal = $(".popup .pp_content", _p.$parentDiv).height()/winheight *50;
				_p.$div.css("left", 50-popupleftVal+"%");
				_p.$div.css("top", 30-popuptopVal+"%");
			};
			_p.resetAlingment();
		} else {
			_p.$div.css("left", _p.left);
			_p.$div.css("top", _p.top);
		}
		
//		if(_p.minWidth==undefined)  _p.minWidth = 0;
//		if(_p.maxWidth==undefined)  _p.maxWidth = 0;
//		if(_p.minHeight==undefined)  _p.minHeight = 0;
//		if(_p.maxHeight==undefined)  _p.maxHeight = 0;
		
		if(_p.defaultLeft==undefined) _p.defaultLeft = _p.left;
		if(_p.defaultTop==undefined) _p.defaultTop = _p.top;
		if(_p.defaultWidth==undefined) _p.defaultWidth = _p.width;
		if(_p.defaultHeight==undefined) _p.defaultHeight = _p.height;
		
		if(_p.left==undefined) _p.left = _p.defaultLeft;
		if(_p.top==undefined) _p.top = _p.defaultTop;
		if(_p.width==undefined) _p.width = _p.defaultWidth;
		if(_p.height==undefined) _p.height = _p.defaultHeight;
		
		_p.$div.width(_p.width);
		_p.$div.height(_p.height);
		
		_p.showLoader = function(){
			this.$loader = utils.custom.miniloader.show(this.$div);
		}
		_p.removeLoader = function(){
			utils.custom.miniloader.stop(this.$loader);
		}
		_p.resetPosition = function(obj){
			if(obj){ 
				if(obj.left!=undefined) this.defaultLeft = obj.left;
				if(obj.top!=undefined) this.defaultTop = obj.top;
				if(obj.right!=undefined) this.defaultRight = obj.right;
			}
			this.$div.css("left", this.defaultLeft);
			this.$div.css("top", this.defaultTop);
		};
		_p.resetSize = function(obj){
			var resetWidth = true; var resetHeight = true;
			if(obj){ 
				resetWidth = false; resetHeight = false;
				if(obj.width!=undefined){
					this.defaultWidth = obj.width;
					resetWidth = true;
				}
				if(obj.height!=undefined){
					this.defaultHeight = obj.height;
					resetHeight = true;
				}
			}
			if(resetWidth) this.$div.width(this.defaultWidth);
			if(resetHeight) this.$div.height(this.defaultHeight);
			if(this._onResize) this._onResize({},{ size : { width: this.$div.width(), height: this.$div.height()}});
		};
		_p.getDim = function(){
			return {
				width : this.$div.width(),
				height : this.$div.height(),
				left : this.$div.css("left").replace("px","")-0,
				top : this.$div.css("top").replace("px","")-0
			}
		}
		// CLOSE FUNCTIONS
		$(".pp_close", _p.$div).click(function() {
			if(_p.close) _p.close();
			_p.remove();
		});
		_p.setTitle = function(title){
			$(".pp_top .title", _p.$div).text(title);
		}
		if(_p.title) _p.setTitle(_p.title);
		
		if(_p.draggable===true){
			_p.draggable ={};
		}
		if(_p.draggable){
			//_p.draggable.snap = true;
			delete _p.draggable.handle;
			_p.draggable.holder = ".pp_top";
			_p.draggable.containment = "parent";
			_p.draggable.disabled = true;
			_p.draggable.iframeFix = true;
			_p.$div.addClass("AllResizableDivs");
			_p.draggable.start = function () {
		        $(".AllResizableDivs").each(function (index, element) {
		        	var maxZ = 1;
		            var d = $('<div tabindex=-1 class="iframeCover" style="zindex:99;position:absolute;width:100%;top:0px;left:0px;height:' + $(element).height() + 'px"></div>');
		            $(element).append(d);
		            if ($(element).css("z-index") > maxZ) {
		                maxZ = $(element).css("z-index");
		            }
		            $(this).css("z-index", maxZ + 1);
		         });
		    };
		    _p.draggable.stop = function (e,ui) {
		        $('.iframeCover').remove();
		        if(_p.draggable.onDrag)  _p.draggable.onDrag(_p,e,ui);
		    };
			_p.$div.draggable(_p.draggable);
			if(_p.draggable.holder){
				_p.$div.draggable("disable");
				$(_p.draggable.holder, _p.$div).mouseenter(function(e){
					_p.$div.draggable("enable");
				});
				$(_p.draggable.holder, _p.$div).mouseleave(function(e){
					_p.$div.draggable("disable");
				});
				$(_p.draggable.holder, _p.$div).mousedown(function(e){
					$("input.dwinput",_p.$div).change();
				});
			}
		}
		if(_p.droppable){
			_p.droppable.drop = function(e,ui){
				if(_p.droppable.onDrop) _p.droppable.onDrop(e,ui,_p)
			};
			_p.droppable.over = function(e,ui){
				if(_p.droppable.onOver) _p.droppable.onOver(e,ui,_p)
			};
			_p.$div.droppable(_p.droppable);
		}
		if(_p.resizable===true){
			_p.resizable ={};
		}
		if(_p.resizable ){
			_p.$div.addClass("AllResizableDivs");
			_p.resizable.containment = "parent";	
			if(!_p.resizable.minHeight) _p.resizable.minHeight = _p.minHeight;
			//_p.resizable.minWidth = _p.minWidth;
			//_p.resizable.side = { top : true, left: true, bottom : true, right : true };
			if(!_p.resizable.handles) _p.resizable.handles = "all";
			_p.resizable.start = function (e,ui) {
		        $(".AllResizableDivs").each(function (index, element) {
		            var d = $('<div class="iframeCover" style="z-index:99;position:absolute;width:100%;top:0px;left:0px;height:' + $(element).height() + 'px"></div>');
		            $(element).append(d);
		        });
		    };
		    _p._onResize = function(e,ui){
		        if(_p.resizable.onResize) _p.resizable.onResize(e,ui,this);
		        if(_p.onResizeNotify){
		        	popup.frameFunction("onResize", { window : popup.window, width : ui.size.width,height : ui.size.height, iframeID : iframeID });
		        }
		    }
		    _p.resizable.stop = function (e,ui) {
		        $('.iframeCover').remove();
		        _p._onResize(e,ui,this);
		    };
			_p.$div.resizable(_p.resizable);
		}
		if(_p.onFocus){
			var $input = $('<input class="dwinput" type="hidden" value=""/>');
			_p.$div.append($input);
			$input.change(function(e){
				_p.onFocus(e);
			});
		}
		if(_p.onTitleDblClick){
			$(".pp_top",_p.$div).dblclick(function(e){
				_p.onTitleDblClick(e);
			})
		}
		
		if(popup.windowURL==undefined && popup.window){
			popup.windowURL = "/app/window/"+popup.window + "?uitoken="+window.uitoken+"&window="+popup.window+"&windowid="+iframeID;
		}
		
		var windowName = (popup.windowName) ? popup.windowName : popup.window;
		_p.$div.attr('window',popup.window);
		if(!_p.scrolling) _p.scrolling = 'scrolling="no"';
		if(popup.windowURL){
			setTimeout(function(){
				_p.$iframe = $('<iframe allowtransparency="true" ' + _p.scrolling +' class="iframe" id=iframe'+iframeID+' name=' + popup.windowName + ' frameborder="0" src="'+popup.windowURL+'"></iframe>');
				$(".iframeContent",popup.$div).append(_p.$iframe);
				if(_p.onload)  _p.$iframe[0].onload = function(e){
					_p.onload(e);
				} 
				_p.send = function(eventName, data){
					utils.xdm.postMessageByFrameId(eventName, data,this.$iframe[0].id);
				}
			},0)
		}
		
		for(var key in _p){
			popup[key] = _p[key];
		}
		if(_p.init) _p.init();
		if(_p.initLoader) _p.showLoader();
		_p._windowOnReady = function(){
			if(this.fadeIn){
				this.$div.removeClass("dn");
				this.$div.hide();
				this.$div.fadeIn(1000);
			}
			this.removeLoader();
			if(this.windowOnReady) this.windowOnReady();
		};
		_p.frameFunction = function(fname,fparam){
			bigpipe.frame[window.windowName].frameFunction({
				iframeName : this.window,
				iframeID : this.__iframeID
			},fname,fparam);
		}
		return popup;
	};
	
	_popup.dffPopup = function($html,popup){
		if(!popup.$parentDiv) popup.$parentDiv = $("body");
		if(popup.background===undefined || popup.background){
			popup.$overlayDiv = $(".popups .pp_overlay");
		}
		var _p = $html.popup(popup);
		_p.$div.addClass("dffPopup");
		if(_p.left==undefined)	_p.left = 165;
		
		_p.resetAlingment = function(){
			var winwidth = $(window).width();
			var winheight = $(window).width();
			var popupleftVal = $(".popup .pp_content", _p.$parentDiv).width()/winwidth *50;
			var popuptopVal = $(".popup .pp_content", _p.$parentDiv).height()/winheight *50;
			_p.$div.css("left", 50-popupleftVal+"%");
			_p.$div.css("top", 30-popuptopVal+"%");
			if(30-popuptopVal < 1)
			_p.$div.css("top", "15px");
			if(popupleftVal < 1)
				_p.$div.css("left", "18%");
			
		};
		_p.resetAlingment();
		
		_p.shouldClose = function(toclose){
			var remove = toclose;
			if(remove == undefined) remove = true;
			if(remove) _p.remove();
		};
		// CLOSE FUNCTIONS
		$(".pp_close", _p.$div).click(function() {
			var _toclose = true;
			if(_p.close) _p.shouldClose(_p.close());
		});
		$(".button.cancel", _p.$div).onClick(function(e) {
			if(_p.cancel){
				_p.shouldClose(_p.cancel(e));
			}
			else if(_p.close) {
				_p.shouldClose(_p.close());
			}
		});
		$(".button.no", _p.$div).onClick(function(e) {
			if(_p.no) _p.shouldClose(_p.no(e));
		});
		$(".button.yes", _p.$div).onClick(function(e) {
			if(_p.yes) _p.shouldClose(_p.yes(e));
		});
		$(".button.ok", _p.$div).onClick(function(e) {
			if(_p.ok) _p.ok(e);
		});
		$(".button.apply", _p.$div).onClick(function() {
			if(_p.apply) _p.apply();
		});
		$(".button.save", _p.$div).onClick(function() {
			if(_p.save){
				if( _p.save()) _p.remove() ;
			}
		});
		
		_p.getValues = function(data, $context){
			if($context==undefined) var $context = _p.$div;
			if(data==undefined) var data = {};
			$(".tag",$context).each(function(index,elem){
				var $elem = $(elem);
				data[$elem.attr("fieldType")] = $elem.getValue();
			})
			return data;
		};
		_p.setValues = function(data, $context){
			if($context==undefined) var $context = _p.$div;
			if(data==undefined) var data = {};
			for(var key in data){
				$(".tag."+key,$context).setValue(data[key]);
			}
			return data;
		};
		_p.getValue = function(key, $context){
			if($context==undefined) var $context = _p.$div;
			return $(".tag."+key,$context).getValue();;
		};
		_p.setValue = function(key,value, $context){
			if($context==undefined) var $context = _p.$div;
			$(".tag."+key,$context).setValue(value);
			return value;
		};
		
		$(".tag", _p.$div).each(function(index,elem){
			$(elem).onChange(function(e, $widget) {
				var filedType = $widget.attr("fieldType");
				if(_p[filedType+"_onchange"])
				_p[filedType+"_onchange"](e,$widget);
			});
		});
		_p.$div.resetTokenInput({
				cssClass : 'tag'
			});
		if(_p.draggable){
			_p.$div.draggable(_p.draggable);
		}
		for(var key in _p){
			popup[key] = _p[key];
		}
		if(_p.init) _p.init();
		else if(_p.onload) _p.onload();
		return popup;
	};
});

select_namespace("utils.custom.sideBar", function(statusBar){
	//TODO:- TO CHECK IF THIS FUNCTION IS BEING USED anywhere
//	window.calendar_input() {
//		$(".demo-input-local-custom-formatters").tokenInput([ {
//			"Currency" : "USD"
//		}, {
//			"Currency" : "JPY"
//		}, {
//			"Currency" : "EUR"
//		} ], {
//			propertyToSearch : "Currency",
//			theme : "facebook"
//		});
//	}
	window.runJugaad = function() {
		if (screen.width < 1280) {
			$('.tradecontent,.Volatilitycontent,.risk_analysiscontent')
					.width(820);
			$('.right_top_btn,.right_top_btn,.topbar').width(990);
			$('.formclm').width(447);
		}
		if (screen.width > 1024) {
			$('.tradecontent,.Volatilitycontent,.risk_analysiscontent')
					.width(870);
			$('.right_top_btn,.right_top_btn,.topbar').width(1040);
			$('.formclm').width(510);
			$('.multileg .rightClm').width(763);
		}
		$(".fx .time_expery_grid tr:even").addClass("even");
		$(".fx .time_expery_grid tr:odd").addClass("odd");
	};
	$(document).ready(function() {
		var $myHeight = $(window).height()-110;
	    $(".sideScrollBar").slimScroll({
			height: $myHeight,
			start: 'top',
			opacity:'0.3',
			position:'right',
			color: 'white',
			distance: '0px'});
		//$('.main').height($(window).height()-30);
	});
})

select_namespace("utils.custom.dividable", function(dividable){
	
	dividable.init = function(){
		$("body").delegate(".custom.dividable:not(.init)", "mouseenter", function(e){
			var $pane = $(this);
			var $divider = $(".separator",$pane);
			//if(!$pane.hasClass("init")){
				$divider.draggable({
					axis: "x",
					containment: "parent",
					drag : function(event,ui){
						var paneOffSet = $pane.offset();
						var paneLeft = paneOffSet.left;
						var thisOffSet = $divider.offset();
						var thisLeft = thisOffSet.left;
						var paneWidth = $pane.width();
						var leftPaneWidth = (thisLeft-paneLeft)/paneWidth *100
						var rightPaneWidth = 100-leftPaneWidth;
						$(".left",$pane).css({'width': leftPaneWidth+"%"});
						$(".right",$pane).css({'width': rightPaneWidth+"%"});
					}
				});
				$pane.addClass("init");
			//}
		});
	}
});

select_namespace("utils.custom.progresBar", function(progresBar){

	progresBar.status = 0;
	progresBar.start = function(){
		progresBar.set(5);
	};
	progresBar.done = function(x){
		if(!x) x = 10 ;
		progresBar.status=progresBar.status-0+(x-0);
		progresBar.set(progresBar.status);
	};
	progresBar.end = function(){
		progresBar.status=0;
		progresBar.set(100);
		window.setTimeout (function(){
			progresBar.set(0);
		}, 1000 );
	};
	progresBar.set = function(x){
		progresBar.status = x;
		if(x>=100) progresBar.status = 0;
		$( "div.prograssBar" ).progressbar({ disabled: false });
		//$("div.prograssBar").progressbar( "option", "value", x);
	};
});

select_namespace("utils.custom", function(custom){
	
	custom.spinnerOptions = {
			lines: 13, // The number of lines to draw
			length: 15, // The length of each line
			width: 3, // The line thickness
			radius: 8, // The radius of the inner circle
			rotate: 11, // The rotation offset
			color: '#FFF', // #rgb or #rrggbb
			speed: 1.5, // Rounds per second
			trail: 94, // Afterglow percentage
			shadow: true, // Whether to render a shadow
			hwaccel: false, // Whether to use hardware acceleration
			className: 'spinner', // The CSS class to assign to the spinner
			zIndex: 2e9, // The z-index (defaults to 2000000000)
			top: 'auto', // Top position relative to parent in px
			left: 'auto' // Left position relative to parent in px	
  	};
	
	custom.canvasOptions = {
			color : '#E0B51B',
			diameter : 51,
			range : 1,
			speed : 5,
			fps : 33,
			density : 106,
			show : true,
			text : $txt('ui.loading')
	}
	custom.colorToHex = function (color) {
			if(!color) return;
    	    if (color.substr(0, 1) === '#') {
    	        return color;
    	    }
    	    var digits = (/(.*?)rgb\((\d+), (\d+), (\d+)\)/).exec(color);
    
    	    var red = parseInt(digits[2]);
    	    var green = parseInt(digits[3]);
    	    var blue = parseInt(digits[4]);
    
    	    var rgb = blue | (green << 8) | (red << 16);
    	    return digits[1] + '#' + rgb.toString(16);
	};
	
	utils.custom.spinner = {
		init : function(){
			custom.canvasOptions.text = $txt('ui.loading');
			custom.canvasOptions.color = custom.colorToHex($("head").css('color'));
		}
	};
	custom.canvas_id = 0;
	custom.canvasID = function(){
		return "c"+ (++custom.canvas_id);
	};
	
	custom.loader = function(){
	  	var loader = {};
	  	loader.init = function(){
	  		custom.canvasOptions.text = utils.messages.get('ui.loading');
	  	}
	  	loader.show = function(hash){
			if(!hash) return;
			var app  =  bigpipe.state.open_apps[hash];
			if(!app.loaderCount){
				app.loaderCount = 0;
			  	var node = app.get_node();
			  	var opts = custom.spinnerOptions;
			  	//app.$overlay = $(".popups .pp_overlay").clone();
			//node.append(app.$overlay);
			var container = document.getElementById(hash);
			var spinner = new Spinner(opts).spin($(".rightarea", container)[0]);
				spinner.hash = hash;
				app.spinner = spinner;
				
		  	};
		  	app.loaderCount++;
			return 	app.spinner;
		};
		loader.stop = function(spinner){
			if(!spinner) return;
			var hash = spinner.hash;
			var app  =  bigpipe.state.open_apps[hash];
			app.loaderCount--;
			if(app.loaderCount==0 && app.spinner){
				app.spinner.stop();	
				//app.$overlay.remove();
	  		}
	  	};	return loader;
	}();

	custom.canvas = true;
	custom.miniloader = function(){
		var loader = {};
		loader.show = function($div,options,db){
			var spinner;
			if($div && $div.length) {
				if(db) db.created0++;
				if($div[0]._spinner && $div[0]._spinner.spinCount){
					$div[0]._spinner.spinCount++; return $div[0]._spinner;
				}
				var $overlay = $(".popups .pp_overlay2").clone();
				$($div).append($overlay);
				if(custom.canvas){
					var id = $div[0].id
					if(!id){ id  = custom.canvasID(); $div[0].id = id;}
					spinner = new CanvasLoader(id,custom.canvasOptions);
					spinner.setColor(custom.canvasOptions.color);
					spinner.setDiameter(custom.canvasOptions.diameter);
					spinner.setDensity(custom.canvasOptions.density);
					spinner.setRange(custom.canvasOptions.range);
					spinner.setSpeed(custom.canvasOptions.speed);
					spinner.setFPS(custom.canvasOptions.fps);
					spinner.show();
					spinner.text = (options && options.text) ? options.text : custom.canvasOptions.text;
					spinner.$text = $('<span class="text">'+spinner.text+'</span>');
					$(spinner.mum).find("#canvasLoader").append(spinner.$text)
				} else {
					var opts = custom.spinnerOptions;
					spinner = new Spinner(opts).spin($div[0]);
				}
				spinner.$overlay = $overlay;
				$div[0]._spinner = spinner;
				$div[0]._spinner.spinCount = 1;
				if(db) db.created1++;
			}
//			var spinner = new Spinner(opts).spin($div[0]);
//			spinner.$overlay = $overlay;
			return 	spinner;
		};
		loader.stop = function(spinner,db){
			if(db) db.killed0++;
			if(!spinner) return;
			try{
				if(spinner.spinCount>0){
					spinner.spinCount--;
				} 
				if(db) db.killed1++;
				if(!spinner.spinCount){
					if(db) db.killed2++;
					//if(spinner.mum)  $('#canvasLoader',$(spinner.mum)).remove();
					if(spinner.mum) delete spinner.mum.spinner;
					if(spinner.$overlay) spinner.$overlay.remove();
					if(spinner.stop) spinner.stop();
					if(spinner.kill) spinner.kill();
				}
				//if(db) console.info(utils.stringify(db)+(db.killed1==db.created0));
			} catch(e){
				LOG.trace("Spinner Remove Exception",e);
			}
		};	
		return loader;
	}();
});

//Common popup
/*
 *  dff.popups.common(app,{
 *  ok : function(){
 *  
 *  }, cancel : function(){
 *  
 *  
 *  }
 *  })  
 * 
 * 
 */

select_namespace("dff.popups", function(namespace) {
	//Common popup
	namespace.common = function(app, _options) {
		var options = (_options) ? _options : {};
		options.$parentDiv = app.get_node();
		return namespace.confirm(app,options)
	};
	namespace.confirm = function(ObjRef, _options) {
		var options = (_options) ? _options : {};
		if (ObjRef.$common)	return;
		ObjRef.$common = $(".popups .commonpopup").dffPopup({
			$parentDiv : options.$parentDiv
		});
		var title = utils.messages.get(options.title);
		if(!title) title = options.title;
		$(".title",ObjRef.$common.$div).text(title);
		var msg = utils.messages.get(options.message);
		if(!msg) msg = options.message;
		$(".commonpopfont",ObjRef.$common.$div).html(msg);
		$(".commonpopfont",ObjRef.$common.$div).width(options.width);
		
		ObjRef.$common.close = function(){
			ObjRef.$common.remove();
			ObjRef.$common = null;
		};
		$(".ok", ObjRef.$common.$div).click(function() {
			ObjRef.$common.close();
			if(options.ok) options.ok();
		});
		ObjRef.$common.$div.delegate(".tag.button:not(.ok)",'click',function(e){
			var fieldType = $(this).attr("fieldType");
			if(options[fieldType] && options[fieldType](e) && ObjRef.$common) ObjRef.$common.close();
		});
		
		for(var key in options){
			if(typeof(options[key]) == 'function') $("."+key, ObjRef.$common.$div).removeClass('dn')
		}
		$(".ok.button", ObjRef.$common.$div).setFocus();
		return options;
	}
});

select_namespace("dff.popups", function(namespace) {	
	namespace.show = function(_popup,arg1,arg2,arg3){
		var data;
		var popup = (_popup ? _popup : {});
		popup.beforeload = function(){
			if(dff.popups && dff.popups[this.popup]){
				data=dff.popups[this.popup].initPopup(this,arg1,arg2,arg3);
			}
		};
		if(popup.window){
			$(".popups ."+popup.popup+":eq(0)").dffWindow(popup);
		} else {
			$(".popups ."+popup.popup+":eq(0)").dffPopup(popup);
		}
		return data;
	};
});

select_namespace("bigpipe", function(bigpipe) {
	bigpipe.HTML_CACHE = {};
	
	bigpipe.$div_onready = function(OBJ){
		//OBJ.ODO = new ODO(OBJ.$div);
		if(OBJ.onload) OBJ.onload();
	};
	
	bigpipe.template = function(OBJ){
		OBJ.template = OBJ.template || OBJ.name;
		if(OBJ.$div){
			bigpipe.$div_onready(OBJ);
		} else {
			if(OBJ.cached && bigpipe.template_cache[OBJ.template]){
				OBJ.$div = $(bigpipe.HTML_CACHE[OBJ.template]);
				bigpipe.$div_onready(OBJ);
			} else {
				OBJ.success = function(html){
					if(OBJ.cached) bigpipe.HTML_CACHE[OBJ.template] = html;
					OBJ.$div = $(html);
					bigpipe.$div_onready(OBJ);
				}
				bigpipe.loadTemplate(OBJ);
			}
		}
		return OBJ;
	};
});
