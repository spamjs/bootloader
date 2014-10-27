utils.custom.defineWidget("date").from('inputbox').as(function(date){
	
	date.readDate = function(dVal){
		var dateObj = utils.date.getDateFromText(dVal,1);
		if(dateObj.isValid && dateObj.display) return dateObj.display;
		return dateObj.toDay;
	};
	
	date.on(".calendar_btn", "click", function(e,uE){
		var $widget = uE.$widget;
		var $this = $(this);
		var $display = $("input.display", $widget);
		var dVal = date.readDate($display.val());
		$(this).DatePicker({
			date : dVal,
			current : dVal,
			onBeforeShow: function(){
				$("input",$widget).DatePickerSetDate(dVal, true);
			},
			onChange: function(formated, dates){
				date.setValue($widget,formated,true,true);
				$widget.focus();
				$(('.datepickerSelected').click).DatePickerHide();
				$('.datepicker:hidden').remove();
				$this.DatePickerHide();
			}
		});
		$(this).DatePickerToggle();
	});
	
	date.override('tag',function(obj){
		obj.formatType = 'date';
		var $tag = this['super'].tag(obj);
		$tag.append('<div class="right_position calendar_btn"></div>');
		return $tag;
	});
	
	date.on_displaychange = function(uE, e) {
        var $widget = uE.$widget;
        var $display = $("input.display", $widget);
        var enteredVal = $display.val();
        return date.setValue($widget,enteredVal,true,true);
    };
    
	date.setValue = function($widget,iVal,validate,trigger,_dVal){
		var _dt = date.validation_map($widget,iVal);
		//if(validate) $widget.setInvalid(_dt.reason, true);
		$(".display", $widget).val(_dt.display).text(_dt.display);
		utils.custom.iVal($widget, (new utils.format.defMap(_dt.time, _dt.display)).prop('isValid',_dt.isValid));
	};
	
	date.validation_map = function($widget,dVal,iVal){
		var _dt = utils.date.getDateFromText(dVal);
		_dt.reason = "ui.invalidInput";
		if(iVal || dVal){
			if(_dt.isTenor && $widget.hasClass("tenor")){
				_dt.isValid = true;
			} else if(_dt.isValid && _dt.time< 31516200000){
				_dt.isValid = false;  _dt.reason = "ui.error.incorrectDateLesThan$1:"+"1 Jan 1971";
			} else if(_dt.isValid && _dt.time > 17103830400000){
				_dt.isValid = false; _dt.reason = "ui.error.incorrectDateGrtThan$1:"+"31 Dec 2511";
			} else if($widget.hasClass("noPast") && _dt.isValid && _dt.isPastDate){
				_dt.isValid = false; _dt.reason = i18n("ui.invalidInputs");
			} else if($widget.hasClass("noToday") && _dt.isValid && !_dt.isFuture){
				_dt.isValid = false; _dt.reason = i18n("ui.invalidInputs");
			}
		}		
		return _dt
	};
});