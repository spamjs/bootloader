utils.define('utils.date', function(date) {

	var padzero = function (n){
		return n < 10 ? '0' + n : n;
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
			if($.inArray(mm,mm31)!= -1  && dd>31) isValid=false;
			else if ($.inArray(mm,mm31)== -1 && dd>30) isValid=false;	
		}
		return isValid;
	};
	
	date.getDateObject = function(dateString){
		var dateString = (''+(dateString || "")).trim();
		var dateObj = { isValid : false, dateString : dateString };
		
		if((/^[0-9]{2,2}[ -]*[A-Za-z]{3,3}[ -]*[0-9]{2,4}$/).test(dateString)){ //NONUS:02-Aug-2011,02 Aug 2011,02Aug2011, NONUS
			dateString = dateString.replace(/[- ]*/gi,"").toLowerCase();
			dateObj.dd = dateString.substr(0,2);
			dateObj.mm = date.getMonthFromName(dateString.substr(2,3));
			dateObj.yy = dateString.substr(5,4);
			dateObj.isValid = true;
		} else if((/^[0-9]{1,1}[ -]*[A-Za-z]{3,3}[ -]*[0-9]{2,4}$/).test(dateString)){//NONUS:2-Aug-11,2 Aug 2011,2Aug2011,NONUS
			dateObj.dateString = dateString.replace(/[- ]*/gi,"").toLowerCase();
			dateObj.dd = dateString.substr(0,1);
			dateObj.mm = date.getMonthFromName(dateString.substr(1,3));
			dateObj.yy = dateString.substr(4,4);
			dateObj.isValid = true;
		} else if((/^[0-9]{1,2}[ -\/][0-9]{1,2}[ -\/][0-9]{2,4}$/).test(dateString)){
			dateString = dateString.replace(/[- \/]+/gi," ");
			var _dateString = dateString.split(" ");
			//US:02/08/11,02/08/2011,02-08-2011,02-08-11
			dateObj.mm = _dateString[0];
			dateObj.dd = _dateString[1];
			dateObj.yy = _dateString[2];
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
    				dateObj.display = date.getDisplayFormat(dateObj);
    				dateObj.time = dateObj.object.getTime();	
				}
			}
		}
		return dateObj;
	};
	
	date.getDisplayFormat = function(dateObj){
		return dateObj.dd + " " +  dateObj.mon + " " + dateObj.yyyy;
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
	
});