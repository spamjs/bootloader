select_namespace("utils.format", function(format){

	format.isEmpty = function(o,_val){
		if(isEmptyString(o.dVal)){
			o.dVal = '';
			o.iVal = '';
			o.isValid = true;
			o.isEmpty = true;
			o.reason = '';
			return true;
		} else if(isEmptyString(o.dVal) && isEmptyString(o.iVal)){
			o.iVal = '';
			o.dVal = '';
			o.isEmpty = true;
			o.isValid = true;
			o.reason = '';
			return true;
		} else	return false;
	};
	format.set("regex",function(value,options){
		return value;
	},function(i){	
		var o = new format.defMap();
		if(isSet(i.iVal) && i.regex){			
			o.isValid =  (new RegExp(i.regex)).test(utils.trim(i.iVal));
			o.dVal=i.iVal;
			o.iVal=i.iVal;
		}else if(isSet(i.dVal) && i.regex){			
			o.isValid = (new RegExp(i.regex)).test(utils.trim(i.dVal));
			o.iVal = o.dVal =i.dVal;
			o.iVal = i.dVal;
		 }
		if(format.isEmpty(o)) return o;
		
		if(!o.isValid){
			o.reason = "ui.invalidInput";
			//TODO :if(i.regexmsg) o.reason=i.regexmsg;
		}else{
			if(isNaN(i.maxlength)){
				i.maxlength=i.maxlength-0;
			}
			if(isNaN(i.minlength)){
				i.minlength=i.minlength-0;
			}
			if(i.maxlength || i.minlength){
				if (i.maxlength < o.iVal.length){
					o.dVal = (o.iVal+"").substr(0,i.maxlength);
					o.iVal = o.dVal;
					} 
				if (i.minlength > utils.trim(o.iVal).length) {
					o.isValid = false;
				//	o.reason = "ui.invalidInput";
					if(isEmpty(o.reason) && (i.minlength) )
						o.reason= "ui.error.inputsTooShort$1:"+i.minlength;
				}
			}
			if(isEmpty(o.iVal)){
				o.isValid = true;
				o.dVal = "";
				o.iVal = "";
				o.reason ="";
			}
		}
		o.tVal =o.dVal;
		return o;		
	});
	
	
	format.set("date",function(value,options){
		if(!options || !options.dateFormat){
			return utils.date.getDateFromText(value).display;
		} else {
			if(utils.date[options.dateFormat])  return utils.date[options.dateFormat](value,options.arg1);
		}
	},function(i){		
		var o = new format.defMap();
		if(isSet(i.iVal)){
			var obj = utils.date.getDateFromText(i.iVal);
			if(obj.isValid){
				o.dVal=obj.display;
				o.iVal=obj.time;
				if(i.format=='CURDATETIME'){
					i.seperator = i.seperator || ' '
					o.dVal = obj.display+i.seperator+
					utils.math.padzeros(obj.object.getHours(),2)
					+ ":"+ utils.math.padzeros(obj.object.getMinutes(),2) 
					+ ":" + utils.math.padzeros(obj.object.getSeconds(),2);
				}
			}			
		} else if(isSet(i.dVal)){
			var obj=utils.date.getDateFromText(i.dVal)
			o.isValid = obj.isValid;
			if(o.isValid){
				o.dVal = obj.display;
				o.iVal = obj.time;
			}
			if(!o.isValid){
				o.reason = "ui.invalidInput";
			}
		}
		o.tVal =o.dVal;
		return o;		
	});
	format.set("percent", function(value,options){
		if(!options) var options = {};
		var obj = utils.math.percentFormat(value,options);
		if(options) {options.dVal = obj.dVal; options.iVal = obj.iVal};
		return options.dVal;
	}, function(i){
		 var o = format.get("nopercent",i);
		 if(o.isValid) {
			 if(o.dVal!=='') o.dVal = o.dVal + "%";
		 }
		 return o;
	});	
	
	format.set("nopercent", function(value,options){
		return value;
	}, function(i){
		var o = new format.defMap();
		o.iVal = i.iVal;
		var num = 10000;
		if(isSet(i.iVal) && i.iVal!==''){
			if(isEmpty(i.iVal)){
				o.dVal = '';
			} else if((''+i.iVal).indexOf("%")==-1){
				o.dVal = i.iVal*100;
			} else {
				o.dVal = utils.math.toDecimal(i.iVal);
				o.iVal = (i.iVal*num)/(100*num);
			}
		} else if(isSet(i.dVal)){
			if(isEmpty(i.dVal)){
				o.iVal = '';
			} else {
				o.dVal = utils.math.toDecimal(i.dVal);
				o.iVal = (o.dVal*num)/(100*num);
			}
		}
		var m = (''+i.iVal).match(/^[+-]?[0-9]*\.?[0-9]*[eE]?[+-]?[0-9]*?[%]?$/)
		var n = (''+i.dVal).match(/^[+-]?[0-9]*\.?[0-9]*[eE]?[+-]?[0-9]*?[%]?$/)
		
		if(isEmpty(o.dVal) ){ //DO NOTHING
		} else if(isNaN(o.dVal) || isNaN(o.iVal) ||(!m && !n) ){ //INVALID VALUE
			o.isValid = false; o.reason = "ui.invalidInput";
			o.dVal = i.dVal; o.iVal = i.iVal; o.tVal = i.dVal;
		} else {
			if(!i.round) i.round = 4;
			o.dVal = utils.math.round(o.dVal,i.round)
		}
		if(format.isEmpty(o)) return o;
		if(o.isValid){
			if(isSet(i.maxValue) && ((i.maxValue-0) < (o.iVal-0))){
				var _maxValue = utils.format.get("percent",i.maxValue);
				o.isValid = false; 
				if(i.fieldType!==undefined)
					o.reason = "ui.error.incorrect"+i.fieldType+"InputValueGrtThan$1:"+_maxValue;
				else
					o.reason = "ui.error.incorrectInputValueGrtThan$1:"+_maxValue;
			}
			if(isSet(i.minValueExpr)){
				if(eval((o.iVal-0)+""+i.minValueExpr)){
					if(i.minValueExpr.indexOf('=')>-1){					
						var reason = "ui.error.incorrect"+i.fieldType+"InputValue$1:"+i.minValueExpr;	
					}else var reason = "ui.error.incorrect"+i.fieldType+"InputValueLesThan$1:"+i.minValue;
					o.isValid = false; o.reason = reason;
				}
			} else if(isSet(i.minValue) && ((o.iVal-0) < (i.minValue-0))){
				var _minValue = utils.format.get("percent",i.minValue);
				o.isValid = false; 
				if(i.fieldType!==undefined)
					o.reason = "ui.error.incorrect"+i.fieldType+"InputValueLesThan$1:"+_minValue;
				else
					o.reason = "ui.error.incorrectInputValueLesThan$1:"+_minValue;
			}
			o.tVal = o.iVal * 100;
		}
		o.tVal =o.dVal;
		return o;
	});
	format.set("default",function(value,options){
		return value;
	}, function(i){
		var o = new format.defMap();
		o.iVal = i.iVal;
		if(isSet(i.dVal)){
			o.dVal = i.dVal;	
		} else if(isSet(i.iVal)){
			o.dVal = i.iVal;
		}
		return o;
	});
	
	format.set("amount",function(value,options){
		if(!options) var options = {};
		var obj = utils.math.KMBTFormat(options.iVal);
		if(options) {options.dVal = obj.dVal,options.iVal = obj.iVal};
		return options.dVal;
	}, function(i){
		var o = new format.defMap();
		if(isSet(i.iVal)){
			var obj = utils.math.KMBTFormat(i.iVal,i);
			if(obj.iVal==="" || obj.dVal===""){
				o.isValid = false; o.reason = "ui.invalidInput";
			} else{
				o.dVal = obj.dVal;
				o.iVal = utils.math.round(obj.iVal-0);
			}
		}else if(isSet(i.dVal)){
			//Match the amount reg-ex to validate KMBT number format
			i.dVal = utils.math.removeCommas(i.dVal);
			if(isNaN(i.dVal)){
	    		var m = i.dVal.match(/^[+-]?[0-9]*\.?[0-9]+[mMkKbBtT]?$/);
		    	if(m && m.length == 1) {
		    	} else{
		    		o.dVal = i.dVal;
		    		o.isValid = false; o.reason = "ui.invalidInput" ;
		    	}
			}
			if(o.isValid){
				var obj = utils.math.KMBTFormat(i.dVal,i);
	    		o.dVal = obj.dVal; 
	    		o.iVal = utils.math.round(obj.iVal-0);
			}
		}
		if(format.isEmpty(o)) return o;
		if(o.isValid){
			if(isSet(i.maxValue) && ((i.maxValue-0) < (o.iVal-0))){
				var _maxValue = utils.format.get("amount",{iVal : i.maxValue}).dVal;
				o.isValid = false; 
				if(i.fieldType!==undefined)
					o.reason = "ui.error.incorrect"+i.fieldType+"AmountValueGrtThan$1:"+_maxValue;
				else
					o.reason = "ui.error.incorrectAmountValueGrtThan$1:"+_maxValue;
			}
			if(isSet(i.minValueExpr)){
				if(eval((o.iVal-0)+""+i.minValueExpr)){
					if(i.fieldType!==undefined)
						o.reason = "ui.error.incorrect"+i.fieldType+"AmountValue$1:"+i.minValueExpr;
					else
						o.reason = "ui.error.incorrectAmountValue$1:"+i.minValueExpr;
					o.isValid = false;
				}
			} else if(isSet(i.minValue) && ((o.iVal-0) <= (i.minValue-0))){
				var _minValue = utils.format.get("amount",{iVal : i.minValue}).dVal;
				o.isValid = false; 
				if(i.fieldType!==undefined)
					o.reason = "ui.error.incorrect"+i.fieldType+"AmountValueLesThanEqual$1:"+_minValue;
				else
					o.reason = "ui.error.incorrectAmountValueLesThan$1:"+_minValue;
			}
			o.tVal = utils.math.addCommasAfterRounding(o.iVal,o.decimals);
		}
		return o;
	});	
	format.set("markup",function(value,options){
		if(!options) var options = {};
		return value;
	}, function(i){
		var o = new format.defMap();
		if(isSet(i.iVal) && (''+i.iVal).match(/^[+-]?[0-9]*\.?[0-9]*[%]$/)){
			o.iVal = o.dVal = i.iVal;
		} else if(isSet(i.dVal) && (''+i.dVal).match(/^[+-]?[0-9]+\.?[0-9]*[%]$/)){
			o.iVal = o.dVal = i.dVal;
		} else {
			o = format.get('amount',i);
		}
		return o;
	});	
	
	format.isDELTA = function(_Val){
		if((/^[aA][tT][mM][sSfF]{0,1}$/).test(''+_Val)) return 'ATM';
		else if((/^[1-9][0-9]*[dD]$/).test(''+_Val)) return 'D'
		else return false;
	}
	format.afterdecimalRound = function(val,round){
		val  = utils.math.round(val,round);
		return val;
	}
	format.set("number",function(value,options){
		if(!round) round = 4;
		return utils.math.round(value,round);
	},function(i){
		//console.log('i',i)
		var o = new format.defMap();
		if(format.isEmpty(i)) 	return o;
		i.isPositive = utils.toBoolean(i.isPositive);
		i.nonZero = utils.toBoolean(i.nonZero);
		if(isSet(i.iVal)){
			if(!utils.math.isNumber(i.iVal)) 	{
				o.dVal=i.iVal;
				o.iVal=i.iVal;
				o.isValid= false;
				o.reason = "ui.invalidInput";
			}
			if(isSet(i.round) && o.isValid){
				o.iVal = i.iVal;
				o.dVal  = format.afterdecimalRound(i.iVal,i.round);
				i.iVal = o.dVal
			}
			o.iVal = o.dVal = i.iVal;	
		} else if(isSet(i.dVal)){
			if(!utils.math.isNumber(i.dVal)) {
				o.dVal=i.dVal;
				o.iVal=i.dVal;
				o.isValid= false;
				o.reason = "ui.invalidInput";
			}
			if(isSet(i.round) && o.isValid){
				o.dVal = format.afterdecimalRound(i.dVal,i.round);
				o.iVal =i.iVal= i.dVal = o.dVal;
			}
			o.iVal = o.dVal = i.dVal;	
		}
		if(format.isEmpty(o)) 	return o;
		
		if(i.isPositive=== true && i.nonZero===true && parseFloat(i.iVal)<=0){
			o.isValid = false; 
			o.reason = "ui.error.incorrectAmountValueLesThanEqualTo$1:"+0;
		}else if(i.isPositive === true && i.nonZero===false && parseFloat(i.iVal)<0){
			o.isValid = false; 
			o.reason = "ui.error.incorrectInputValueLesThan$1:"+0;
		}else if(i.nonZero===true && i.iVal==0){
			o.isValid = false; 
			o.reason = "ui.error.incorrectInputValueEqualTo$1:"+0;
		}
		if(o.isValid) {			
			if(isSet(i.minValueExpr)){
				if(eval((o.iVal-0)+""+i.minValueExpr)){
					if(i.minValueExpr.indexOf('=')>-1){					
						var reason = "ui.error.incorrectInputValueExp$1:"+i.minValueExpr;	
					}else var reason = "ui.error.incorrectInputValueLesThan$1:"+i.minValue;
					o.isValid = false; o.reason = reason;
				}
			} else if(isSet(i.minValue) && ((i.iVal-0) < (i.minValue-0))){
				o.isValid = false; //incorrectInputValueGrtThan$1
				o.reason = "ui.error.incorrectInputValueLesThan$1:"+i.minValue;
			}
			if(isSet(i.maxValue) && ((i.maxValue-0) < (o.iVal-0))){
				o.isValid = false; 
				o.reason = "ui.error.incorrectInputValueGrtThan$1:"+i.maxValue;
			}
			o.tVal = o.dVal;
		}				
		if(!o.isValid && !o.reason){
			o.reason = "ui.invalidInput";
		}

		return o;
	});
	format.set("delta",function(value,options){
		return value;
	}, function(i){
		var o = new format.defMap();
		if(isSet(i.iVal)){
			if(!format.isDELTA(i.iVal)){
				o.isValid = !isNaN(i.iVal);
				if(o.isValid) {
					if(isSet(i.round)){
						i.iVal  = format.afterdecimalRound(i.iVal,i.round);
					}
				}
			} else o.isDelta = true;
			o.iVal = o.dVal = i.iVal;
		} else if(isSet(i.dVal)){
			//console.log('i.dVal',utils.duplicate(i))
			if(!format.isDELTA(i.dVal)){
				o.isValid = !isNaN(i.dVal);
				i.dVal  = format.afterdecimalRound(i.dVal,i.round);
			} 
			else o.isDelta = true;
			o.iVal = o.dVal  = i.iVal = i.dVal;
			//console.log('o.dVal',utils.duplicate(o))
		} else {
			//o.isValid = false; 
		}
		if(format.isEmpty(o)) return o;

		if(!o.isDelta && isSet(i.minValueExpr) && eval((o.iVal-0)+""+i.minValueExpr)){
			o.isValid = false; 
			o.reason = "ui.error.incorrectInputValueExp$1:"+i.minValueExpr;
		}else if(!o.isDelta && isSet(i.minValue) && ((i.iVal-0) < (i.minValue-0))){
			o.isValid = false; 
			o.reason = "ui.error.incorrectInputValueLesThan$1:"+i.minValue;
		} 
		
		if(!o.isValid && !o.reason){
			o.reason = "ui.invalidInput";
		}
		o.tVal = o.dVal;
		//console.log('o',o)
		return o;
	});	
	
	format.set("yieldStrike",function(value,options){
		return value;
	}, function(i){
		if(i.curValue=='strike'){
			return format.get('delta',i);
		} else {
			return format.get('nopercent',i);
		}
	});	
	
	format.set("suffix",function(value,options){
		return value;
	}, function(i){
		var o = new format.defMap();
		var suffix = "";
		if(i.suffix) suffix = i.suffix;
		
		if(isSet(i.iVal) && i.iVal!==''){
			o.iVal = i.iVal;
			o.dVal = i.iVal.replace(suffix, "");
		} else if(isSet(i.dVal)){
			o.dVal = i.dVal;
			o.iVal = o.dVal + suffix;
		}

		if(isEmpty(o.dVal) ){ //DO NOTHING
		} else if(isNaN(o.dVal)){ //INVALID VALUE
			o.isValid = false; o.reason = "ui.invalidInput";
			o.dVal = i.dVal; o.iVal = i.iVal; o.tVal = i.dVal;
		} 

		if(format.isEmpty(o)) return o;
		if(o.isValid){
			if(isSet(i.maxValue) && ((i.maxValue-0) < (o.dVal-0))){
				o.isValid = false; 
				if(i.fieldType!==undefined)
					o.reason = "ui.error.incorrect"+i.fieldType+"InputValueGrtThan$1:"+i.maxValue;
				else
					o.reason = "ui.error.incorrectInputValueGrtThan$1:"+i.maxValue;
			}
			if(isSet(i.minValueExpr)){
				if(eval((o.dVal-0)+""+i.minValueExpr)){
					if(i.minValueExpr.indexOf('=')>-1){					
						var reason = "ui.error.incorrect"+i.fieldType+"InputValue$1:"+i.minValueExpr;	
					}else var reason = "ui.error.incorrect"+i.fieldType+"InputValueLesThan$1:"+i.minValue;
					o.isValid = false; o.reason = reason;
				}
			} else if(isSet(i.minValue) && ((o.dVal-0) < (i.minValue-0))){
				o.isValid = false; 
				if(i.fieldType!==undefined)
					o.reason = "ui.error.incorrect"+i.fieldType+"InputValueLesThan$1:"+i.minValue;
				else
					o.reason = "ui.error.incorrectInputValueLesThan$1:"+i.minValue;
			}
		}
		if(!o.isValid && !o.reason){
			o.reason = "ui.invalidInput";
		}
		
		o.tVal =o.dVal;
		return o;
	});	
	
	format.set("moneyness",function(value,options){
		return value;
	}, function(i){
		var o = new format.defMap();
		var num = 10000;
		if(isSet(i.iVal)){
			if(isNaN(i.iVal)){
				i.iVal = i.iVal.toUpperCase();
				o.iVal = i.iVal;
				
				var exp = i.iVal.match("ATM\\-|ATM\\+");
				var percent = i.iVal.replace(/[A-Za-z+-]*/, "");
				if(exp && exp.length==1 && percent!==""){
					o.isValid = true;
					percent = format.afterdecimalRound((percent-0)*100,4);
					o.dVal = exp[0]+percent;
				}else{
					if(i.iVal =="ATM"){
						o.isValid = true;
						o.dVal =  i.iVal;
					}else{
						o.isValid = false;
					}
				}
			}else{
				if((i.iVal-0) <= 0){
					o.isValid = false;
					o.iVal = o.dVal = i.iVal;
				}else{
					o.dVal = format.afterdecimalRound(i.iVal*100,4);
					o.iVal = utils.math.toDecimal(i.iVal);
					o.isValid = true;
				}
			}
		} else if(isSet(i.dVal)){
			if(isNaN(i.dVal)){
				i.iVal = i.dVal.toUpperCase();
				o.dVal = i.dVal;
				var exp = i.iVal.match("ATM\\-|ATM\\+");
				var percent = i.iVal.replace(/[A-Za-z+-]*/, "");
				if(exp && exp.length==1 && percent!==""){
					o.isValid = true;
					percent = format.afterdecimalRound((percent-0)/100,4);
					o.iVal = exp[0]+percent;
				}else{
					if(i.iVal =="ATM"){
						o.isValid = true;
						o.iVal =  i.iVal;
					}else{
						o.isValid = false;
					}
				}
			}else{
				if((i.dVal-0) <= 0){
					o.isValid = false;
					o.iVal = o.dVal = i.dVal;
				}else{
					o.dVal = format.afterdecimalRound(i.dVal,4);
					o.iVal = (o.dVal*num)/(100*num);
					o.isValid = true;
				}
			}
		} else {
			//o.isValid = false; 
		}
		if(format.isEmpty(o)) return o;
		
		if(!o.isValid && !o.reason){
			o.reason = "ui.invalidInput";
		}
		o.tVal = o.dVal;
		return o;
	});
});
