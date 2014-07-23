utils.selectNamespace("utils.math", function(math){
	
	math.isNumber = function(value){
		return (!isNaN(value-0) && typeof(value-0)=='number')
	};
	math.round = function(value,numberOfDecimals){
		if(value===undefined || value==="" || value ===null) return "";
		if (isNaN(value)) return value;
		value = parseFloat(value)
		if(math.getNumberType(value)=="expo") return math.getroundvalue(value,numberOfDecimals);
		if(!numberOfDecimals) var numberOfDecimals=0;
		var num = 10000;
	    if (typeof(numberOfDecimals) == typeof (1))
	    	num = Math.pow(10, numberOfDecimals);
	    value =  Math.round(value*num)/num;
	    if(numberOfDecimals){
	    	var val = (value+'').split('.');
	    	if(!isSet(val[1])) val[1] = '0';
	    	val[1] = (""+val[1]+'0000000000000000000').substr(0,numberOfDecimals);
	    	value = val[0]+'.'+val[1];
	    }
	    return value;
	};
	math.getroundvalue = function(value, numberOfDecimals){
	    if (((typeof value) != (typeof 234.23)) & ((typeof value) != (typeof 234)))
	        return value; 
	    var num = 10000;
	    value = parseFloat(value);
	    if (typeof(numberOfDecimals) == typeof (1))
	    	num = Math.pow(10, numberOfDecimals);
	    return Math.round(value*num)/num;
	};
	math.getRoundValue = function(value, numberOfDecimals){
		if(value==undefined) return "";
		if (isNaN(value)) return value;
		//if(math.getNumberType(value)=="expo") return value;
		if(!numberOfDecimals) numberOfDecimals=0;
		var val = math.getroundvalue(value, numberOfDecimals);
		if(math.getNumberType(value)=="expo") return val;
		if(val==undefined || val==='') return '';
		var index=(''+val).indexOf(".");
		if(index!= -1)
			val = (""+val).substr(0,index+numberOfDecimals-0+1);
		if(isNaN(val)) return 0;
		return (val-0);
	};
	math.addCommas = function(nStr){
		if(nStr==undefined) return "";
		nStr = math.removeCommas(nStr);
		x = nStr.split('.');
		x1 = x[0];
		x2 = x.length > 1 ? '.' + x[1] : '';	
		var rgx = /(\d+)(\d{3})/;
		while (rgx.test(x1)) {
			x1 = x1.replace(rgx, '$1' + ',' + '$2');
		}
		return x1 + x2;
	};
	math.eFormat = function(nStr,limit,digit,decimals){
		if(nStr==undefined) return "";
		nStr = math.removeCommas(nStr);
		x = nStr.split('.');
		var x1 = x[0];
		
		if(limit==undefined) var limit = 6
		if(x1.length>limit){
			if(digit==undefined) var digit = limit-2
			return (nStr-0).toExponential(digit).toUpperCase();
		}
		if(x[1] && decimals!==undefined)
			x[1] = x[1].substr(0,decimals);
		var x2 = x.length>1 && decimals > 1 ? '.' + x[1] : '';	
		var rgx = /(\d+)(\d{3})/;
		while (rgx.test(x1)) {
			x1 = x1.replace(rgx, '$1' + ',' + '$2');
		}
		return x1 + x2;
	};
	math.removeCommas = function(nStr){
		if(nStr==undefined) return "";
	    nStr += '';
		return nStr.replace(/,/gi,"").replace(/ /gi,"");
	};
	math.toDecimal = function(nStr){
	    nStr += '';
		return nStr.replace(/%/gi,"")-0;
	};
	math.addPercent = function(num){
		return num = math.removePercent(num)+'%';
	}
	math.removePercent = function(num){
		return (''+num).replace(/%/gi,"");
	};
	math.toPercent = function(nStr){
		return math.toDecimal(nStr)+"%";
	};
	math.toPercentFormat = function(value, dec, isDisplayValue){
		if(value==undefined) return "";
		var raw = value;
		if((''+value).indexOf("%")==-1){
			if(!isDisplayValue) value = value*100;
			raw = (math.getroundvalue(value,(dec-0)));
		} else {
			value = math.removePercent(value);
			raw = math.toDecimal(math.getroundvalue(value,dec-0));
		}
		raw = math.afterDecimal(raw,dec);
		return raw+"%";
	};
	math.noPercentFormat = function(value, dec, isDisplayValue){
		if(value==undefined) return "";
		var raw = value;
		if((''+value).indexOf("%")==-1){
			if(!isDisplayValue) value = value*100;
			raw = (math.getroundvalue(value,(dec-0)));
		} else {
			value = math.removePercent(value);
			raw = math.toDecimal(math.getroundvalue(value,dec-0));
		}
		raw = math.afterDecimal(raw,dec);
		return raw;
	};
	math.percentFormat = function(value,options){
		var iVal = value;
		var dVal = value;
		if(!options) var options = {};
		if(!options.round) options.round = 0;
		if((''+value).indexOf("%")!=-1){
			dVal = utils.math.toPercentFormat(iVal,options.round);
			iVal = utils.math.toDecimalFormat(dVal);
		} else {
			if(value === ""){
				dVal = "";
				iVal = "";
			}else {
				dVal = utils.math.toPercentFormat(iVal,options.round);
			}
		}
		return { iVal : iVal-0, dVal : dVal };
	};
	math.afterDecimal = function(raw,dec){
		if(raw==="") return raw;  ///TODO- TO CHECK
		if(isNaN(raw)) return raw;
		var raws = (raw+"").split(".");
		if(!dec) return raws[0];
		if(raws[1]==undefined){ raws[1] = ""; }
		if(raws[0]==="") raws[0] = "0";
		raws[1] = (raws[1] + "0000000000000000").substr(0,dec);
		return raws[0] + "." + raws[1];
	};
	math.toDecimalFormat = function(value){
		if((''+value).indexOf("%")==-1)
			return (value-0)/100;
		return math.toDecimal(value)/100;
	};
	math.toDecimalNumber = function(value,dec){
		if((''+value).indexOf("%")==-1)
			return (value-0);
		return math.toDecimal(value)/100;
	};
	math.addCommasAfterRounding = function(value, numberOfDecimals ){
		var val = math.getRoundValue(value-0, numberOfDecimals);
		if(val!=undefined && !isNaN(val))
			return math.addCommas(val);
		else return "";
	};
	math.KMBTFormat = function(mString,o){
		var dVal = "";
		var iVal = 0;
		if(!o) var o = {};
		if(!o.limit) o.limit = 14; //Limit Applicable to Numbers(without KMBT), If it exceeds the limt  than Gets KMBT
		if(!o.digit) o.digit = 5;//Limit Applicable to  Numbers(with KMBT)
		if(!o.decimals){
			o.decimals = 0; 
			if(o.round) o.decimals=o.round;
		}
		if(!o.maxdigits) o.maxdigits = 14;
		mString = math.removeCommas(mString);
		var numType = math.getNumberType(mString);
		iVal = math.netValue(mString,numType);
		iVal = (iVal+""); var sign = "";	
		var _limit=o.limit; 
		var _digit=o.digit;
		if((iVal).match(/^[-+]{0,1}[0-9]+[\.]{0,1}[0-9]*$/)){
			//if(iVal.indexOf("-")==0){iVal = iVal.replace("-",""); sign = "-";o.limit=o.limit-1;o.digit=o.digit-1; }
			if(iVal.indexOf("-")==0){
				_limit=o.limit-1;
				_digit=o.digit-1;
			}else{
				_limit=o.limit
				_digit=o.digit
			}
			var part = (iVal+"").split(".");
			var length = part[0].length;
			if(length<=_limit){
				dVal = math.getRoundValue(iVal-0,o.decimals);
				dVal = math.addCommas(dVal)
			} else if(length>12){
				dVal = math.getRoundValue(iVal/1000000000000-0,_digit-(length-12))+"T";
			} else if(length>9){
				dVal = math.getRoundValue(iVal/1000000000-0,_digit-(length-9))+"B";
			} else if(length>6){
				dVal = math.getRoundValue(iVal/1000000-0,_digit-(length-6))+"M";
			} else if(length>3){
				dVal = math.getRoundValue(iVal/1000-0,_digit-(length-3))+"K";
			} else if(length>0){
				dVal = math.getRoundValue(iVal-0,0);
			} else dVal = mString;

		 	}else if(numType == 'expo'){
				dVal = math.round(iVal,o.decimals); 
		 	}else dVal = mString; 
		return { iVal : sign+iVal, dVal : sign+dVal ,decimals: o.decimals};

	};
	math.netValue = function(mString,numType){
		var sign  = 1;
		if(mString==undefined) mString = "";
		if(mString.indexOf("-")==0){mString = mString.replace("-",""); sign = -1; }
		if (numType=="integer"){
			return sign * parseInt(mString);
		} else if (numType=="float"){
			return sign * parseFloat(mString);
		} else if(!isNaN(mString) && mString!==""){
			return sign * parseFloat(mString);
		} else {
			var mString = mString.toUpperCase();
			var thousandRegex = /^[0-9]*[\.]{0,1}[0-9]*[K]$/;
			var millionRegex = /^[0-9]*[\.]{0,1}[0-9]*[M]$/;
			var billionRegex = /^[0-9]*[\.]{0,1}[0-9]*[B]$/;
			var trillionRegex = /^[0-9]*[\.]{0,1}[0-9]*[T]$/;
			if (mString.match(thousandRegex))
				return sign * math.getNumVal(mString.substr(0,mString.length-1))*1000;
			else if (mString.match(millionRegex))
				return sign * math.getNumVal(mString.substr(0,mString.length-1))*1000*1000;
			else if (mString.match(billionRegex))
				return sign * math.getNumVal(mString.substr(0,mString.length-1))*1000*1000000;
			else if (mString.match(trillionRegex))
				return sign * math.getNumVal(mString.substr(0,mString.length-1))*1000*1000000000;
			else {
				return "";
			}
		}
	};
	math.amountValue = function(mString){
		mString = math.removeCommas(mString);
		mString = math.removePreceedingZeros(mString);
		if (mString==='') return '';
		if (!mString) return 0;
		mString = ""+mString;
		var numType = math.getNumberType(mString);
		if(numType=="expo"){
			return (mString+"");
		}
		return math.netValue(mString,numType);
	};
	math.amountFormat = function(dVal,o,round){
		if(dVal==undefined || dVal==="") return { iVal : "", dVal : "" };
		if(o) var round = o.round;
		dVal = utils.math.amountValue(dVal);
		dVal = math.getRoundValue(dVal,round);
		var iVal = utils.math.removeCommas(dVal);
		if(!o) var o = {};
		if(o.round==undefined)  o.round = 0;
		if(o.limit==undefined)  o.limit = 10;
		if(o.digit==undefined)  o.digit = 2;
		if(o.decimals==undefined)  o.decimals = 0;
		iVal = math.getRoundValue(iVal,o.round);
		if(math.getNumberType(iVal)=="expo"){
			dVal = (iVal+"").toUpperCase();
			var DVAL = dVal =dVal.split("E");
			dVal = math.afterDecimal(DVAL[0],o.digit)+"E"+DVAL[1];
		} else if ((""+iVal).length <= o.limit) {
			dVal = math.addCommas(iVal);
		} else{
			//dVal = math.formatAsCurSymbol(iVal);
			//nStr,limit,digit,decimals
			dVal = math.eFormat(iVal,o.limit,o.digit,o.decimals);
		}
		return { iVal : iVal, dVal : dVal };
	};
	math.formatAsCurSymbol = function(myStr){
		//1,000,000,000,000
		myStr = "" + myStr;
		var strLength = myStr.length
		if (strLength < 11) return myStr;
		var number = parseInt(myStr)/ math.getAmountBase(strLength);
		var decimalAdjustedNum = math.getRoundValue ("" + number, 2);
		return decimalAdjustedNum + getSymbol(strLength);
	};
	math.getAmountBase = function(lengthNum){
		if (lengthNum > 9 && lengthNum <= 12) return Math.pow(10, 9);
		else if (lengthNum > 12) return Math.pow(10, 12);
	};
	math.getSymbol = function(lengthNum){
		if (lengthNum > 9 && lengthNum <= 12) return "B";
		else if (lengthNum > 12) return "T";
	}
	//Paddings
	math.removePreceedingZeros = function(mString){
		mString = mString + "";
		while (mString.indexOf("0") === 0 && mString.length != 1){
				mString = mString.substr(1);
		}
		if(mString.indexOf(".") == 0) mString = "0" + mString;
		return mString;
	};
	math.padzeros = function (n, digits){
		var max = (digits-1)*10;
		var itslen = (n+'').length;
		var zeros = Math.pow(10,(digits-itslen)) + '';
		zeros = zeros.substr(1);
		return zeros +''+ n;
	};
	math.getNumVal = function(mString){
		if (!mString) return 0;
		mString = ""+mString;
		if (math.getNumberType(mString)=="integer"){
			return parseInt(mString);
		} else if (math.getNumberType(mString)=="float"){
			return parseFloat(mString);
		} else return "";
	};
	math.getNumberType = function(mStr){
		if (mStr == null) {
	        return "null";
	    }
	    mStr = "" + mStr;
	    if (mStr == "") {
	       return "null";
	    }
		if ((""+ mStr).substr(0,1) == "="){
			return "formula";
		}
	    
		var numericExpression = /^[0-9]+$/;
		var myStr;
		if ( (mStr.substr(0,1) == "+") || (mStr.substr(0,1) == "-") ) {
		    myStr = mStr.substr(1);
		} else {
		    myStr = mStr;
		}

		if(myStr.toUpperCase() == "TRUE" || myStr.toUpperCase() == "FALSE"){
			return "boolean";
		}
		if(myStr.match(numericExpression)){
			return "integer";
		} else {
			if(((myStr).toString()).match(/^([0-9]*[.]*[0-9]+)[eE][+-]*[0-9]+$/)){
				if(!isNaN(myStr)) return "expo";
			}
		    var mPos = myStr.indexOf(".");
		    if (mPos < 0) {
		        return "text";
		    }
		    var myLeftStr = myStr.substr(0, mPos);
		    var myRightStr = myStr.substr(mPos+1);
		
		if(myStr.substr(0, 1) == "." && myRightStr.match(numericExpression)){
			return "float";
		}
	    	if(!myLeftStr.match(numericExpression)){
		    	return "text";
			}
	    	if(!myRightStr.match(numericExpression)){
		    	return "text";
			}
			return "float";
			
		}
	};
	math.interpolate = function(x, x1, y1, x2, y2) {
		return y1 + (x - x1) * (y2 - y1) / (x2 - x1);
	};
	math.linear_interpolate = function(x, y, a){
		if(!x) return 0;
		if (a <= x[0])
			return y[0];
		else if (a >= x[x.length - 1])
			return y[x.length - 1];

		for (var i = 0; i < x.length; i++) {
			if (a < x[i]) {
				return math.interpolate(a, x[i - 1], y[i - 1], x[i], y[i]);
			}
		}
	};
	//CUSTOM FORMATS
	utils.format.set("commasAfterRounding",function(value,options){
		var numberOfDecimals = 0;
		if(options && options.round!==undefined) numberOfDecimals = options.round;
		return math.addCommasAfterRounding(value,numberOfDecimals);
	});
	utils.format.set("decimal",function(value,options){
		var numberOfDecimals = 0;
		if(options && options.round!==undefined) numberOfDecimals = options.round;
		return math.getRoundValue(value,numberOfDecimals);
	});
	utils.format.set("amount",function(value,options){
		var obj = math.KMBTFormat(value,options);
		if(options) {options.dVal = obj.dVal; options.iVal =obj.iVal};
		return options.dVal;
	});
});
