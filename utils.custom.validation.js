utils.selectNamespace("utils.custom.validation", function(validation){
	
	validation.fadeOutTime = 3000;
	
	validation.init = function(){
		
		$("body").delegate("div.tag:not(.tokeninput, .inputbox, .date, .amount) input.display", "change", function(e){
			var $widget = $(this).parent(".tag");
			//$this.trimError();
			if(!$widget.isValid()){
				$widget.setInvalid(i18n("ui.invalidInputs"), true);
			} else $widget.setInvalid();
			$widget.removeClass("editmode");
		});
		
		$("body").delegate("a.tag.error, div.tag.error, div.tag.error input", "focus", function(){
			$(this).showBubble();
		});
		$("body").delegate("a.tag.error, div.tag.error, div.tag.error input", "blur", function(){
			$(this).hideBubble();
		});
		
		window.showErrorNotification = function(message, div){
			$(div).showBubble(message);
		};
		
		window.hideErrorNotification = function(div){
			$(".message_bubble.fix").fadeOut(000);
		}
		window.fadeErrorNotification = function(message, div){
				$(div).showBubble(message);
				$(".message_bubble.fix").fadeOut(validation.fadeOutTime);
		}
	};
	
	$.fn.isValid = function(attr){
		var $this = $(this);
		var iVal = $this.getValue();
		var dVal = $("input.display",$this).val();
		//$(".option", $this).toggleClass("dn");
		//var value = $(".option:not(.dn)", $this).text();
		if($this.hasClass("amount")){
			return utils.custom.amount.isValid($this,dVal);
		}
		if($this.hasClass("buisday")){
			if(iVal || dVal){
				var iVal = $this.getValue();
				var tenor = $("input.value", $this).val();
	    		var m = tenor.match(/^[1-9][0-9]*[bB]*[dD]$/);
		    	if(m && m.length == 1) return true;
				return false;
			} else return true;

		} return true;
	};
	
	$.fn.showBubble = function(msg, clone){
		var $widgetParent = $(this);
		if($(this).length==0) return null;
		
		if(!$widgetParent.is(":visible")) return;
		
		var $bubble = $(".message_bubble.fix");
		if(clone){
			$bubble = $(".message_bubble.fix").clone();
			$bubble.removeClass("fix");
			$("body").append($bubble);
		}
		//$bubble.css('top',0).css('left',0);
		//$widgetParent.append($bubble);
			var $this = this;
			var jThis = this.offset();
			var iTop = jThis.top;
			var iHeight = jThis.height;
			var iLeft = jThis.left;
			var iWidth = this.innerWidth();
			var bubbleLeft = iLeft+iWidth+10;
			var bubbleTop = iTop;
			var wRightOffest = window.pageXOffset+window.innerWidth;
			var bubbleRight = wRightOffest-(bubbleLeft+215);
			$bubble.removeClass("left right");
			if(bubbleRight<0){
				bubbleLeft = bubbleLeft-215-iWidth;
				 $bubble.addClass("left");
			} else $bubble.addClass("right");
			
			if(!msg)
				var msg = this.attr("msg");
			$(".message_text",$bubble).text(utils.messages.get(msg));
			$bubble.removeClass("dn");
			$bubble.css('top',bubbleTop).css('left',bubbleLeft);
			$bubble.fadeIn(0);
		return $bubble;
	}
	$.fn.hideBubble = function(){
		var $bubble = $(".message_bubble.fix");
		$bubble.addClass("dn")
		$(".message_bubble_home").append($bubble);
	}
	$.fn.fadeOutBubble = function(){
		var $fade = this.showBubble("", true);
		if($fade) $fade.fadeOut(validation.fadeOutTime, function(){
			$fade.remove();
		});
	}
	$.fn.setInvalid = function(msg, fade){
		this._setError("invalid",msg,fade);
	};
	$.fn.setError = function(msg,fade){
		this._setError("incorrect",msg,fade);
	};
	$.fn.setWarning = function(msg,fade){
		this._setError("warning",msg,fade);
	};
	$.fn._setError = function(erorType,msg,fade){
		var $this = this;
		if(msg){
			$this.addClass(erorType + " error");
			$this.attr('msg', msg);
			if(fade && $this.is(":visible")){
				var $fade = this.fadeOutBubble();
			}
		} else {
			$this.trimError();
		}
	};
	$.fn.trimError = function(error){
		var $this = this;
		if(!error){
			$this.removeClass("incorrect invalid missing warning");
			$(".message_bubble.fix").addClass("dn");
		} else $this.removeClass(error);
		if($this.hasClass("incorrect")){}
		else if($this.hasClass("invalid")){}
		else if($this.hasClass("missing")){}
		else if($this.hasClass("warning")){}
		else {
			$this.removeClass("error");
			$this.attr('msg', "");
			$(".message_bubble.fix").addClass("dn");
		}
	};
	$.fn.hasError = function(erorType){
		var $this = this;
		if(erorType!==undefined){
			if($this.hasClass(erorType)){ return true;}
			else return false;
		}
		if($this.hasClass("incorrect")){ return true;}
		else if($this.hasClass("invalid")){ return true;}
		else if($this.hasClass("missing")){ return true;}
		else if($this.hasClass("error")){ return true;}
		else if($this.hasClass("warning")){ return true;}
		else return false;
	};
});


function isValidDate(s) {
    // format D(D)/M(M)/(YY)YY
    var dateFormat = /^\d{1,4}[\.|\/|-]\d{1,2}[\.|\/|-]\d{1,4}$/;

    if (dateFormat.test(s)) {
        // remove any leading zeros from date values
        s = s.replace(/0*(\d*)/gi,"$1");
        var dateArray = s.split(/[\.|\/|-]/);
      
        // correct month value
        dateArray[1] = dateArray[1]-1;

        // correct year value
        if (dateArray[2].length<4) {
            // correct year value
            dateArray[2] = (parseInt(dateArray[2]) < 50) ? 2000 + parseInt(dateArray[2]) : 1900 + parseInt(dateArray[2]);
        }

        var testDate = new Date(dateArray[2], dateArray[1], dateArray[0]);
        if (testDate.getDate()!=dateArray[0] || testDate.getMonth()!=dateArray[1] || testDate.getFullYear()!=dateArray[2]) {
            return false;
        } else {
            return true;
        }
    } else {
        return false;
    }
}


