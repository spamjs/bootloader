select_namespace("utils.date", function(date){
	
	utils.agent.dateformat = 0;
	utils.agent.timeformat = 24;
	utils.agent.timezone = "GMT";
	date.getCurDate = function(){
		if(window.cur_dt)
			return window.cur_dt();
		else return (new Date()).getTime();
	};
	date.getObject = function(dateString,code){
		if(dateString==undefined) return new Date(date.getCurDate());
		else return date.getDateFromText(dateString,code).object;
	};
	
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
		
		if(code==undefined) var code = utils.agent.dateformat;
		if(isNaN(dateString)){
    		var m = dateString.match(/^[1-9][0-9]*[dwmyDWMY]$/);
    		var m2 = dateString.match(/^[1-9][0-9]*[bB]*[dD]$/);
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
		return dateObj;
	};
	date.getDisplayFormat = function(dateObj,code){
		if(code==undefined) var code = utils.agent.dateformat;
		if(code==0)
			return dateObj.mon + " " +  dateObj.dd + " " + dateObj.yyyy;
		return dateObj.dd + " " +  dateObj.mon + " " + dateObj.yyyy;
	};
	
	utils.format.set("date",function(value,options){
		if(!options || !options.dateFormat){
			return date.getDateFromText(value).display;
		} else {
			if(date[options.dateFormat])  return date[options.dateFormat](value,options.arg1);
		}
	});
	
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
		var _dt = date.toStringFormat(dt);
		var time;
		if(timeformat == "12_hr")
			time = date.convertToAMPM(dt.getHours(), dt.getMinutes(), dt.getSeconds());
		else
			time = dt.getHours()+ ":"+ dt.getMinutes() + ":" + dt.getSeconds();
		return _dt + " " + time;
	}
	
	date.convertDate = function(timestamp, timezone){
		if(!timezone) var timezone = utils.agent.timezone;
		var inputDate = new Date(timestamp);
		var inputOffset = inputDate.getTimezoneOffset();
		var offset = timezone.substr(3);
		if(offset == "") offset = "+00:00";
		var multiplier = (offset.charAt(0) == "+") ? 1 : -1;
		var hr = offset.substring(1, 3)-0;
		var min = offset.substring(4)-0;
		var newOffset = ((hr * 60) + min) * multiplier;
		var finalTime = inputDate.getTime() + ((inputOffset + newOffset) * 60000);
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
	
	date.Timer = function(){
		var startTime = new Date().getTime();
		var now = function(){
		var s = new Date().getTime();
		var diff = s - startTime;
		return diff;
		}
		return now;
	}
	date.debugTimerMap = {};
	date.debugTimer = function(timer,clearNew){
		if(!date.debugTimerMap[timer] || clearNew){
			date.debugTimerMap[timer] = new date.Timer();
		} return timer + ":" + date.debugTimerMap[timer]();
	} 
	
	utils.debug = function(timer,message,clear){
		console.info(utils.date.debugTimer(timer,clear),message);
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
});