select_namespace("utils.custom.hotkeys", function(hotkeys){
	/*jQuery.hotkeys
			8: "backspace", 9: "tab", 13: "return", 16: "shift", 17: "ctrl", 18: "alt", 19: "pause",
			20: "capslock", 27: "esc", 32: "space", 33: "pageup", 34: "pagedown", 35: "end", 36: "home",
			37: "left", 38: "up", 39: "right", 40: "down", 45: "insert", 46: "del", 
			96: "0", 97: "1", 98: "2", 99: "3", 100: "4", 101: "5", 102: "6", 103: "7",
			104: "8", 105: "9", 106: "*", 107: "+", 109: "-", 110: ".", 111 : "/", 
			112: "f1", 113: "f2", 114: "f3", 115: "f4", 116: "f5", 117: "f6", 118: "f7", 119: "f8", 
			120: "f9", 121: "f10", 122: "f11", 123: "f12", 144: "numlock", 145: "scroll", 191: "/", 224: "meta"	

	 */
	if(jQuery.hotkeys){
		hotkeys.importantKeyList = [];
		hotkeys.isPressed = [];
		
		hotkeys.set = function(){
			hotkeys.reservedKey = ["C", "V", "Z", "X", "T", "P"];
			hotkeys.isBlocked = { "8": true };
			
			hotkeys.key_1_code = 17;
			//hotkeys.key_2_code = 16;
			hotkeys.key_3_code = 16;  //SHIFT MODE KEY
			
			hotkeys.key_1 = charForCode(hotkeys.key_1_code);
			hotkeys.key_2 = (hotkeys.key_2_code)? charForCode(hotkeys.key_2_code):null;
			hotkeys.key_3 = charForCode(hotkeys.key_3_code);
			
			hotkeys.keyComb = (hotkeys.key_2) ? (hotkeys.key_1+"+"+hotkeys.key_2) : hotkeys.key_1 ;
		};
		hotkeys.isDffKey = function(event){
			if ((/textarea|select/i.test( event.target.nodeName ) ||
					 event.target.type === "text" || event.target.type === "password") ) {
					return (event.shiftKey && event.ctrlKey);
				}
			return event.ctrlKey;
		}
		hotkeys.init = function(){
			hotkeys.set();
			$(document).keyup(function (e) {
				var key = (e.keyCode || e.which);
				hotkeys.isPressed[key] = undefined;
				if(hotkeys.isDffKey(e)){
					preventPropagation(e);
					var $sel = null
					var charCode = charForCode(key).toUpperCase();
					if(!charCode) return;

					if($.inArray(charCode,hotkeys.reservedKey)==-1){
						if(hotkeys[charCode]){
							 hotkeys[charCode]();
						} else {
							try{
								if($app && $app.get_tab){
									$sel = $(".hotkey[key='"+charCode+"']:not(.dn)", $app.get_tab());
									if(!$sel.length){
										$sel = $(".hotkey[key='"+charCode+"']:not(.dn)", $node);
										if($sel.length)	$sel.click();
									} else $sel.click();
								}
							} catch(err){
								if(bigpipe & $C.statusBar)
									$C.statusBar.showMessage("NoKeyDefined");
							}
						}
						//hotkeys.startPreventPropagation(e,charCode);
					}
//				} else if(key==hotkeys.key_1_code || key==hotkeys.key_3_code){
//					hotkeys.key_1_pressed = false;
//				} else if(hotkeys.keyList[key]){
//					exucuteFunction(key,e)
				} else if(key>=112 && key<=123){
					var $sel = null
					var charCode = charForCode(key).toUpperCase();
					if(!charCode) return;
					try{
						if($app && $app.get_tab){
							$sel = $(".hotkey[singleKey='"+charCode+"']:not(.dn)", $app.get_tab());
							if(!$sel.length){
								$sel = $(".hotkey[singleKey='"+charCode+"']:not(.dn)", $node);
								if($sel.length)	$sel.click();
							} else $sel.click();
							preventPropagation(e);
						}
					} catch(err){
						if(bigpipe && $C.statusBar) $C.statusBar.showMessage("NoKeyDefined");
					}
				}
				//clearTimeout(hotkeys.pressTimer);
			});
			$(document).keydown(function (e) {
				var key = (e.keyCode || e.which);
				hotkeys.isPressed[key] = 1;
				if(hotkeys.isDffKey(e)){
					preventPropagation(e);
//				} else if(key==hotkeys.key_1_code){
//					hotkeys.key_1_pressed = true;
//				} else if(hotkeys.key_1_pressed && key==hotkeys.key_3_code){
//					window.dffKey = true;
				} else if(hotkeys.importantKeyList[key]){
					exucuteFunction(key,e);
					return false;
				} 
			});
			
			hotkeys.addKey("backspace",function(e){
				if($(e.target).parents(".tag").length || $(e.target).hasClass("tag")){
					return true;
				}
				preventPropagation(e);
				return false;
			});
		}	
		hotkeys.startPreventPropagation = function(e, charCode){
			var charLower = charCode.toLowerCase();
//			if(charLower==hotkeys.key_1 || charLower==hotkeys.key_2)
//					window.dffKey = false;
			return false;
		};
		
		hotkeys.bindKey = function(key,cb){
			hotkeys[key] = cb;
		};
		hotkeys.addKey = function(charCode,cb, important){
			if(important){
				var code = codeForChar(charCode);
				if(!hotkeys.importantKeyList[code]) hotkeys.importantKeyList[code] = [];
				hotkeys.importantKeyList[code].push(cb);
			} else {
				jQuery(document).bind('keydown', charCode,cb);
			}
		};
		
		hotkeys.charForCode = function(code){
			return charForCode(code);
		};
		function charForCode(code){
			var charCode = jQuery.hotkeys.specialKeys[code];
			if(charCode) return charCode.toLowerCase();
			else if(typeof(code)=="string") return (code).toLowerCase();
			else return String.fromCharCode(code).toLowerCase();
		}
		function codeForChar(charCode){
			var CHAR = charCode.toLowerCase();
			for(var code in  jQuery.hotkeys.specialKeys){
				if(jQuery.hotkeys.specialKeys[code]==CHAR){
					return code;
				}
			}
		}
		
		function exucuteFunction(key,e){
			for(var i in hotkeys.importantKeyList[key]){
				if(hotkeys.importantKeyList[key][i] && typeof(hotkeys.importantKeyList[key][i])=='fucntion')
					hotkeys.importantKeyList[key][i](e);
				else LOG.warn("NOSHORTCUT DEFINED FOR KEY "+key);
			}
		};
		
		hotkeys.setMultiTask = function(key, data){
		};
		hotkeys.disable = function(){
			window.dffKeyDisabled = true;
		};
		hotkeys.enable = function(){
			window.dffKeyEnabled = true;
		};
	}
});