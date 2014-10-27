select_namespace("utils.date", function(date){
	
	utils.agent.dateformat = 0;
	utils.agent.timeformat = 24;
	utils.agent.timezone = "GMT";
	utils.agent.timezone_offset = 0;
	utils.agent.clientUTCDiff = 0;
	utils.setAgent.serverTime = function(value,diff){
		var inMS = new Date(value).getTime()-0+diff;
		if(!isNaN(inMS)) utils.agent.clientUTCDiff = (Math.round(new Date().getTime()/1000)*1000)-inMS;
	};
	date.Time = function(useTimeZone){
		if(useTimeZone) return (new Date().getTime() - utils.agent.clientUTCDiff);
		return date.convertDate(new Date().getTime() - utils.agent.clientUTCDiff);
	};
	date.Date = function(){
		return new Date(date.convertDate(new Date().getTime() - utils.agent.clientUTCDiff));
	};
	date.getCurDate = function(){
		if(window.cur_dt)
			return window.cur_dt();
		else return (new Date()).getTime();
	};
	date.getObject = function(dateString,code){
		if(dateString==undefined) return new Date(date.getCurDate());
		else return date.getDateFromText(dateString,code).object;
	};
	
	date.getValidationForDate = function(day,month,year) {
		var dd = parseInt(day);
		var mm = parseInt(month);
		var yy = parseInt(year);
		var isValid=true;
		var mm31= [1,3,5,7,8,10,12];
		if(mm>12) isValid=false;
		if(mm==2){
			if(yy%400 !=0 && yy%4 !=0){
				if(dd>28) isValid=false;
			}else if (dd>29) isValid=false;
		}else{
			if(utils.indexOf(mm31,mm)!= -1  && dd>31) isValid=false;
			else if (utils.indexOf(mm31,mm)== -1 && dd>30) isValid=false;	
		}
		return isValid;
	}
	//INPUT:string,OUTPUT: validated date object,
	date.getDateFromText = function(dateString,code) {
		if(!utils.isValid(dateString)) var dateString = "";
		var dateObj = new Date(date.getCurDate()-0);
		dateObj.time = 0;
		dateObj.display = "";
		dateObj.isValid = false;
		dateObj.isTenor = false;
		dateObj.isBuisDay = false;
		dateObj.toDay = dateObj.getDate() +" "  + date.getNameOfMonth(dateObj.getMonth()-0+1+"") + " " + dateObj.getFullYear();
		if(dateString instanceof Date){
			dateString = dateString.getTime();
		}
		if(code==undefined) var code = utils.agent.dateformat;
		if(isNaN(dateString)){
			dateString = dateString+''
    		var m = dateString.match(/^[1-9][0-9]*[dwmyDWMY]$/);
    		var m2 = dateString.match(/^[0-9][0-9]*[bB]*[dD]$/);
	    	if(m && m.length == 1){
	    		dateObj.isTenor = true;
	    		dateObj.display = dateString;
	    		dateObj.time = dateString;
	    	} else if(m2 && m2.length == 1){
	    		dateObj.isTenor = true;
	    		dateObj.isBuisDay = true;
	    		dateObj.display = dateString;
	    		dateObj.time = dateString;
	    	} else {
	    		//TO CHECK DATE FORMAT
	    		if((/^[0-9]{2,2}[ -]*[A-Za-z]{3,3}[ -]*[0-9]{2,4}$/).test(dateString)){ //NONUS:02-Aug-2011,02 Aug 2011,02Aug2011, NONUS
    				dateString = dateString.replace(/[- ]*/gi,"").toLowerCase();
    				dateObj.dd = dateString.substr(0,2);
    				dateObj.mm = date.getMonthFromName(dateString.substr(2,3));
    				dateObj.yy = dateString.substr(5,4);
    				dateObj.isValid = true;
       			} else if((/^[0-9]{1,1}[ -]*[A-Za-z]{3,3}[ -]*[0-9]{2,4}$/).test(dateString)){//NONUS:2-Aug-11,2 Aug 2011,2Aug2011,NONUS
    				dateString = dateString.replace(/[- ]*/gi,"").toLowerCase();
    				dateObj.dd = dateString.substr(0,1);
    				dateObj.mm = date.getMonthFromName(dateString.substr(1,3));
    				dateObj.yy = dateString.substr(4,4);
    				dateObj.isValid = true;
    			} else if((/^[0-9]{1,2}[ -\/][0-9]{1,2}[ -\/][0-9]{2,4}$/).test(dateString)){
    				dateString = dateString.replace(/[- \/]+/gi," ");
    				var _dateString = dateString.split(" ");
    				if(code==1 ){ //NONUS:02/08/11,02/08/2011,02-08-2011,02-08-11
        				dateObj.dd = _dateString[0];
        				dateObj.mm = _dateString[1];
        				dateObj.yy = _dateString[2];
    				} else if(code==0){//US:02/08/11,02/08/2011,02-08-2011,02-08-11
        				dateObj.mm = _dateString[0];
        				dateObj.dd = _dateString[1];
        				dateObj.yy = _dateString[2];
    				}
    				dateObj.isValid = true;	
    			} else if((/^[A-Za-z]{3,3}[ -]*[0-9]{2,2}[ -]*[0-9]{2,4}$/).test(dateString)){ //US:02-Aug-2011,02 Aug 2011,02Aug2011,
    				dateString = dateString.replace(/[- ]*/gi,"").toLowerCase();
    				dateObj.mm = date.getMonthFromName(dateString.substr(0,3));
    				dateObj.dd = dateString.substr(3,2);
    				dateObj.yy = dateString.substr(5,4);
    				dateObj.isValid = true;
    			} else if((/^[A-Za-z]{3,3}[ -]*[0-9]{1,1}[ -]*[0-9]{2,4}$/).test(dateString)){//US:2-Aug-11,2 Aug 2011,2Aug2011
    				dateString = dateString.replace(/[- ]*/gi,"").toLowerCase();
    				dateObj.mm = date.getMonthFromName(dateString.substr(0,3));
    				dateObj.dd = dateString.substr(3,1);
    				dateObj.yy = dateString.substr(4,4);
    				dateObj.isValid = true;
    			} 
    			
	    		if(dateObj.isValid){
	    			if(dateObj.yy.length==2)	dateObj.yyyy = "20"+dateObj.yy;
	    			else if(dateObj.yy.length==4) { dateObj.yyyy = dateObj.yy; dateObj.yy = dateObj.yy.substr(2,2); }
	    			else { dateObj.isValid = false; }
	    			if(dateObj.isValid){
	    				if(dateObj.mm.length==1) dateObj.mm = "0" + dateObj.mm;
	    				if(dateObj.dd.length==1) dateObj.dd = "0" + dateObj.dd;
	    				if(dateObj.mm>12 && dateObj.dd<13){ //SWAP MONTH AND DATE
	    					var _mm = dateObj.mm;
	    					dateObj.mm = dateObj.dd;
	    					dateObj.dd = _mm;
	    				}
	    				dateObj.isValid = date.getValidationForDate(dateObj.dd,dateObj.mm,dateObj.yyyy);  
	    				if(dateObj.isValid){
	    					dateObj.object = new Date(dateObj.mm+"/"+dateObj.dd+"/"+dateObj.yyyy + " 12:00:00 GMT");
		    				dateObj.dd = padzero(dateObj.object.getUTCDate());
		    				dateObj.mm = padzero(dateObj.object.getUTCMonth()+1+"");
		    				dateObj.yyyy = dateObj.object.getUTCFullYear();
		    				dateObj.mon = date.getNameOfMonth(dateObj.mm)
		    				dateObj.display = date.getDisplayFormat(dateObj,code);
		    				dateObj.time = dateObj.object.getTime();	
	    				}
	    			}
	    		}
	    	}
		} else {
			if((dateString) >31516200000){
				dateObj.time = dateString;
				dateObj.isValid = true;
				if ((typeof dateObj.time) != (typeof 1)) dateObj.display = dateObj.time;	    
			    if (!dateObj.time) dateObj.display = "";
			    else {
			    	dateObj.object = new Date(dateObj.time - 0);
					dateObj.dd = padzero(dateObj.object.getUTCDate());
					dateObj.mm = padzero(dateObj.object.getUTCMonth()+1+"");
					dateObj.yyyy = dateObj.object.getUTCFullYear();
					dateObj.mon = date.getNameOfMonth(dateObj.mm)
					dateObj.display = date.getDisplayFormat(dateObj,code);
					dateObj.time = dateObj.object.getTime();
			    }
			} else {
				dateObj.isValid = false;
				if(dateString == ""){
					dateObj.display = "";
					dateObj.isValid = true;
					dateObj.time = 0;
				}
					
			}
		} 
		if(dateObj.isValid){
			dateObj.isPastDate = dateObj.time < date.getCurDate();
			dateObj.isFuture = (dateObj.time > date.getCurDate());
		}
		return dateObj;
	};
	date.getDisplayFormat = function(dateObj,code){
		if(code==undefined) var code = utils.agent.dateformat;
		if(code==0)
			return dateObj.mon + " " +  dateObj.dd + " " + dateObj.yyyy;
		return dateObj.dd + " " +  dateObj.mon + " " + dateObj.yyyy;
	};
	
	//date_to_str
	
	date.toString = function(millis) {
	    var _dt = date.getDateFromText(millis);
	    if(_dt.isValid)
	    	return _dt.mm+"/"+_dt.dd+"/"+_dt.yyyy;
	    return "";
	};
	date.toStringFormat = function(millis) {
	    return date.getDateFromText(millis).display;
	};
	var padzero = function (n){
		return n < 10 ? '0' + n : n;
	};

	date.stringToTime = function(str) {
	    if ((typeof str) != (typeof "asd")) return str; 
		var dd = str.split("/");
		if (dd.length == 3){
	    	return new Date(dd[2], dd[0]-1, dd[1]).getTime();
	    } else return "";
	};

	date.filterDate = function(time){
		return time;
		//return (new Date(utils.date.toStringFormat(time-0))).getTime();
	};
	
	date.systemTime = function(timestamp){
		var currentTime = new Date();
		if(timestamp!==undefined)
			currentTime = new Date(timestamp-0);
        var hours = currentTime.getHours();
        var minutes = currentTime.getMinutes();
        var seconds = currentTime.getSeconds();
        return date.convertToAMPM(hours, minutes, seconds);
	};
	date.convertToAMPM = function(hours, minutes, seconds){
	    var now = "";
        if (minutes < 10){
            minutes = "0" + minutes;
        }
        if (seconds < 10){
        	seconds = "0" + seconds;
        }
        hoursx=hours%12;
        if(hoursx == 0)
        	hoursx = hours;
        if (hoursx < 10){
            hoursx = "0" + hoursx;
        }
        now  = now + "" + hoursx + ":" + minutes + ":" + seconds + " ";

        if(hours > 11){
            now  = now + "PM";
        } else {
            now  = now + "AM";
        }        
        return now;
	};
	
	date.getDisplay = function(timestamp, timezone, dateformat, timeformat){
		if(!timezone) var timezone = utils.agent.timezone;
		if(!dateformat) var dateformat = utils.agent.dateformat;
		if(!timeformat) var timeformat = utils.agent.timeformat;
		var dt = new Date(date.convertDate(timestamp, timezone));
		date._month = date.getNameOfMonth(dt.getMonth()-0+1+"");
		date._year = dt.getFullYear();
		var _dt = dt.getDate() +" "  + date._month + " " + date._year;
		var time;
		if(timeformat == "12_hr")
			time = date.convertToAMPM(dt.getHours(), dt.getMinutes(), dt.getSeconds());
		else
			time = dt.getHours()+ ":"+ dt.getMinutes() + ":" + dt.getSeconds();
		return _dt + " " + time;
	}
	
	date.getDisplayAsPerUser = function(timestamp,dateOnly){
		var timezone = utils.agent.timezone;
		if(!dateformat) var dateformat = utils.agent.dateformat;
		if(!timeformat) var timeformat = utils.agent.timeformat;
		var dt = new Date(date.convertDate(timestamp-0, timezone));
		var day = date.getNameOfDay(dt.getDay())+ ", ";
		if(dateOnly) return date.toStringFormat(dt);
		
		return day+ date.getDisplay(timestamp-0);
	}
	
	date.convertDate = function(timestamp, timezone){
		if(!timezone) var timezone = utils.agent.timezone;
		var timezone_offset = (utils.agent.timezone_offset-0)/1000;
		if(!timezone) timezone_offset = 0;
		var inputDate = new Date(timestamp);
		var inputOffset = inputDate.getTimezoneOffset();
		var offset = timezone.substr(3);
		if(offset == "") offset = "+00:00";
		var multiplier = (offset.charAt(0) == "+") ? 1 : -1;
		var hr = offset.substring(1, 3)-0;
		var min = offset.substring(4)-0;
		var newOffset = ((hr * 60) + min) * multiplier;
		var finalTime = inputDate.getTime() + (inputOffset + timezone_offset);
		return finalTime;
	}


	//RETURNS :  Wed,23Jan2012,12:00:01
	date.toLocaleString = function(timestamp,timeformat){
		var d = new Date(timestamp-0);
		var dt = date.getNameOfDay(d.getDay())+", "
		if(utils.agent.dateformat == 0)
			dt += date.getNameOfMonth(d.getMonth()+1+"") + " " + d.getDate() + " " + d.getFullYear()+", ";
		else
			dt += d.getDate() + " " + date.getNameOfMonth(d.getMonth()+1+"") + " " + d.getFullYear()+", ";
		if(!timeformat) var timeformat = utils.agent.timeformat; 
		var time;
		if(timeformat == "12_hr")
			time = date.convertToAMPM(d.getHours(), d.getMinutes(), d.getSeconds());
		else
			time = d.getHours()+ ":"+ d.getMinutes() + ":" +d.getSeconds();
		return dt + time;
	};
	
	date.curDateTime = function(timestamp, seperator){
		if(!seperator) var seperator = " ";
		var d = date.getDateFromText(timestamp);
		return d.display+seperator+
		 padzero(d.object.getHours())+ ":"+ padzero(d.object.getMinutes()) + ":" + padzero(d.object.getSeconds());
	};
	
	date.getMonthFromName = function(monthStr) {
		monthStr = "" + monthStr;
		monthStr = monthStr.toLowerCase();
		switch (monthStr) {
		case "jan":
			return "01";
		case "feb":
			return "02";
		case "mar":
			return "03";
		case "apr":
			return "04";
		case "may":
			return "05";
		case "jun":
			return "06";
		case "jul":
			return "07";
		case "aug":
			return "08";
		case "sep":
			return "09";
		case "oct":
			return "10";
		case "nov":
			return "11";
		case "dec":
			return "12";
		default:
			return monthStr;
		}
	};
	date.getNameOfMonth = function(monthStr){
		switch(monthStr) {
			case "1" : return "Jan";
			case "2" : return "Feb";
			case "3" : return "Mar";
			case "4" : return "Apr";
			case "5" : return "May";
			case "6" : return "Jun";
			case "7" : return "Jul";
			case "8" : return "Aug";
			case "9" : return "Sep";
			case "10" : return "Oct";
			case "11" : return "Nov";
			case "12" : return "Dec";
			case "01" : return "Jan";
			case "02" : return "Feb";
			case "03" : return "Mar";
			case "04" : return "Apr";
			case "05" : return "May";
			case "06" : return "Jun";
			case "07" : return "Jul";
			case "08" : return "Aug";
			case "09" : return "Sep";
		}
	};
	date.getNameOfDay = function(dayStr){
		switch(dayStr+"") {
			case "0" : return "Sun";
			case "1" : return "Mon";
			case "2" : return "Tue";
			case "3" : return "Wed";
			case "4" : return "Thu";
			case "5" : return "Fri";
			case "6" : return "Sat";
		}
	};
	
	//tenors' functions
	date.compareTenors = function(tenor1, tenor2){
		//logic for ON, TN, SN
		//1st tenor
		if(tenor1 == "ON")
			return -1;
		else if(tenor1 == "TN"){
			if(tenor2 == "ON")
				return 1;
			else
				return -1;
		}else if(tenor1 == "SN"){
			if(tenor2 == "ON" || tenor2 == "TN")
				return 1;
			else
				return -1;
		}
		//2nd tenor
		else if(tenor2== "ON")
			return 1;
		else if(tenor2 == "TN"){
			if(tenor1 == "ON")
				return -1;
			else
				return 1;
		}else if(tenor2 == "SN"){
			if(tenor1 == "ON" || tenor1 == "TN")
				return -1;
			else
				return 1;
		}
		
		//logic for D, W, M, Y
		var upperCaseVal1 = tenor1.toUpperCase();
		var upperCaseVal2 = tenor2.toUpperCase();
		var lastChar1 = upperCaseVal1.charAt(upperCaseVal1.length - 1);
		var lastChar2 = upperCaseVal2.charAt(upperCaseVal2.length - 1);
		var numVal1 = parseInt(upperCaseVal1.substr(0, upperCaseVal1.length - 1));
		var numVal2 = parseInt(upperCaseVal2.substr(0, upperCaseVal2.length - 1));
		
		if(lastChar1 == "D"){
			if(lastChar2 == "D")
				return (numVal1 > numVal2) ? 1 : -1;
			else if(lastChar2 == "W")
				return (numVal1 > date.weekToDays(numVal2)) ? 1 : -1;
			else
				return -1;
		}else if(lastChar1 == "W"){
			if(lastChar2 == "D")
				return (date.weekToDays(numVal1) > numVal2) ? 1 : -1;
			else if(lastChar2 == "W")
				return (numVal1 > numVal2) ? 1 : -1;
			else if(lastChar2 == "M" || lastChar2 == "Y")
				return -1;
		}else if(lastChar1 == "M"){
			if(lastChar2 == "M")
				return (numVal1 > numVal2) ? 1 : -1;
			else if(lastChar2 == "D" || lastChar2 == "W")
				return 1;
			else if(lastChar2 == "Y")
				return (numVal1 > date.yearToMonths(numVal2)) ? 1 : -1;
		}else if(lastChar1 == "Y"){
			if(lastChar2 == "Y")
				return (numVal1 > numVal2) ? 1 : -1;
			else if(lastChar2 == "D" || lastChar2 == "W")
				return 1;
			else if(lastChar2 == "M")
				return (date.yearToMonths(numVal1) > numVal2) ? 1 : -1;
		}
	}
	
	date.yearToMonths = function(tenorNumVal){
		return tenorNumVal * 12;
	}
	date.weekToDays = function(tenorNumVal){
		return tenorNumVal * 7;
	}
	date.monthsToYear = function(tenorNumVal){
		return tenorNumVal / 12;
	}
	date.daysToWeek = function(tenorNumVal){
		return tenorNumVal / 7;
	}
	
	date.tenorsIndexOf = function(list, tenor){
		var alsoCompare = date.getEquivalentTenor(tenor);
		return ((utils.indexOf(list, tenor) != -1) || (utils.indexOf(list, alsoCompare) != -1)) ? 1 : -1;
	}
	
	date.getEquivalentTenor = function(tenor){
		var alsoCompare = "";
		if(tenor.indexOf("W") != -1){
			var upperCaseVal = tenor.toUpperCase();
			var numVal = parseInt(upperCaseVal.substr(0, upperCaseVal.length - 1));
			alsoCompare = date.weekToDays(numVal) + "D";
		}else if(tenor.indexOf("Y") != -1){
			var upperCaseVal = tenor.toUpperCase();
			var numVal = parseInt(upperCaseVal.substr(0, upperCaseVal.length - 1));
			alsoCompare = date.yearToMonths(numVal) + "M";
		}else if(tenor.indexOf("D") != -1){
			var upperCaseVal = tenor.toUpperCase();
			var numVal = parseInt(upperCaseVal.substr(0, upperCaseVal.length - 1));
			alsoCompare = date.daysToWeek(numVal) + "W";
		}else if(tenor.indexOf("M") != -1){
			var upperCaseVal = tenor.toUpperCase();
			var numVal = parseInt(upperCaseVal.substr(0, upperCaseVal.length - 1));
			alsoCompare = date.monthsToYear(numVal) + "Y";
		}
		return alsoCompare;
	}
});
