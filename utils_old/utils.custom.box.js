select_namespace("utils.custom.box", function(box){

	box.tag = function(obj){
		var $tag = utils.custom._tag(obj);

		if (obj.value === undefined)
			obj.value = {};
		var _boxhtml = box.getHTML(obj.value)

		for ( var key in obj.value) {
			obj.attr['data-' + key] = obj.value[key]
			// obj.data('data-' + key,obj.value[key]);
		}
		obj.attr['limit'] = 5
		obj.attr['json'] = utils.stringify(obj.value || {});		
		$tag.append(_boxhtml);
		return $tag;
	};

	box.getHTML = function(value){
		var _value = new Object(value);
		var checked = _value.checked;
		if(checked === undefined) checked = "checked";

		//if(_value.partNotional) _value.notnl = _value.partNotional;
		var notnl = utils.format.get("amount",{iVal : _value.notnl}).dVal;
		var premiumBid =  utils.format.get("amount",{iVal : _value.bidPremium, limit : 5}).dVal;
		var premiumAsk =  utils.format.get("amount",{iVal : _value.askPremium, limit : 5}).dVal;

		if (_value.mode == 'e') {
			var _boxhtml ='';
			_boxhtml = _boxhtml + '<span class="action checkBoxIco '+checked+'" name="checkBox">Select</span>';
			_boxhtml = _boxhtml + '<div class="price">';
			_boxhtml = _boxhtml + '<input class="action priceBid" limit="5" name="bidPremium" formatType="amount" placeholder="Bid"  type="text" value="'+premiumBid+'">';
			_boxhtml = _boxhtml + '<input class="action priceAsk" limit="5"  name="askPremium" formatType="amount" placeholder="Ask"  type="text" '+
									'value="'+premiumAsk+'">';
			_boxhtml = _boxhtml + '</div>';
			_boxhtml = _boxhtml + '<div class="sep">&nbsp;</div>';
			_boxhtml = _boxhtml + '<input class="action notnl" name="notnl" limit="10" placeholder="Notnl." formatType="amount" type="text" value="' + notnl + '">';
		} else if (_value.mode == 'r'){
			var _boxhtml ='<div class="action checkBoxIco '+checked+'" name="checkBox">';
			if(_value.info) _boxhtml = _boxhtml + '<span class="info" title="'+ _value.info +'">&nbsp;</span>';
			_boxhtml = _boxhtml + '<input class="price" name="price" type="button"  value="' +  premiumBid +' / ' +  premiumAsk + '">';
			_boxhtml = _boxhtml + '<div class="sep">&nbsp;</div>';
			_boxhtml = _boxhtml + '<span class="nontnLabel">Notnl.</span><input class="notnl" limit="10" name="notnl" type="button" value="' + notnl + '">';
			_boxhtml = _boxhtml +'</div>';
		}
		return _boxhtml;
	}

	box.init = function(){
		$("body").delegate(".box.tag:not(.readOnly) .action", "click", function(e){
			var $widget = $(this).parents('.tag');
			e.action = 'click';
			e.name = $(this).attr('name');
			e.$widget = $widget;
			return utils.custom.execute($widget, e);
		});
		$("body").delegate(".box.tag:not(.readOnly) input", "change", function(e){
			var $this = $(this);
			var $widget = $this.parents('.tag');
			e.action = 'change';
			e.name = $this.attr('name');
			$widget.data(e.name ,$this.val());
			box.setJSON($widget,e.name ,$this.val())
			e.$widget = $widget;
			return utils.custom.execute($widget, e);
		});
	};
	box.setJSON = function($widget,attr,value){
		var map = utils.parse($widget.attr('json') || '{}') || {};
		map[attr] = value;
		$widget.attr('json',utils.stringify(map) || {});
	}
	box.getValue = function($widget, attr){
		if(attr==undefined)
			return utils.parse($widget.attr('json') || '{}');
		else return utils.parse($widget.attr('json') || '{}')[attr];
		return $widget.data(attr);
	};
	box.setValue = function($widget, value, callOnChange){
		$widget.html(box.getHTML(value))
		$widget.data(value);
		var map = utils.parse($widget.attr('json') || '{}');
		$widget.attr('json',utils.stringify($.extend(map,value) || {}));
		return $widget.data();
	};
});
// /Single leg header tag start here
select_namespace("utils.custom.slhead", function(slhead){

	slhead.tag = function(obj){
		var $tag = utils.custom._tag(obj);

		if (obj.value === undefined)
			obj.value = {};
		var _slheadhtml = slhead.getHTML(obj.value)

		for ( var key in obj.value) {
			obj.attr['data-' + key] = obj.value[key]
		}
		$tag.append(_slheadhtml);
		return $tag;
	};

	slhead.getHTML = function(value){
		var _value = new Object(value);
		var  _slheadhtml = '<span class="cpty">' + _value.cpty + '</span>';
			_slheadhtml = _slheadhtml  +'<span class="counterVal" id="cptyCounter'+_value.cpty+'">' + _value.counterVal + '</span>';
			if(value.canRequote)
				_slheadhtml = _slheadhtml  +'<span class="action" name="requote">&nbsp;</span>';
		return _slheadhtml;
	}

	slhead.init = function(){
		$("body").delegate(".slhead.tag:not(.readOnly) .action", "click", function(e){
			var $widget = $(this).parents('.tag');
			e.action = 'click';
			e.name = $(this).attr('name');
			e.$widget = $widget;
			return utils.custom.execute($widget, e);
		});
		$("body").delegate(".slhead.tag:not(.readOnly) input", "change", function(e){
			var $this = $(this);
			var $widget = $this.parents('.tag');
			e.action = 'change';
			e.name = $this.attr('name');
			$widget.data(e.name ,$this.val())
			e.$widget = $widget;
			return utils.custom.execute($widget, e);
		});
	};
	slhead.getValue = function($widget, attr){
		return $widget.data(attr);
	};
	slhead.setValue = function($widget, value, callOnChange){
		$widget.html(slhead.getHTML(value))
		$widget.data(value);
		return $widget.data();
	};
})

//ML Head
select_namespace("utils.custom.mlhead", function(mlhead){

	mlhead.tag = function(obj){
		var $tag = utils.custom._tag(obj);

		if (obj.value === undefined)
			obj.value = {};
		var _mlheadhtml = mlhead.getHTML(obj.value)

		for ( var key in obj.value) {
			obj.attr['data-' + key] = obj.value[key]
		}
		$tag.append(_mlheadhtml);
		return $tag;
	};

	mlhead.getHTML = function(value){
		var _value = new Object(value);
		var  _mlheadhtml = '';
		if(_value.mode=="r"){
    		_mlheadhtml = _mlheadhtml  +'<span class="cpty">' + _value.cpty + '</span>';
		}
	     _mlheadhtml = _mlheadhtml  +'<span class="total">' + _value.totalPrice + '</span>';
	     if(_value.mode=="r"){
        	 _mlheadhtml = _mlheadhtml  +'<span class="counterVal" id="cptyCounter'+_value.cpty+'">' + _value.tte + '</span>';
        	 if(value.canRequote)
        		 _mlheadhtml = _mlheadhtml  +'<span class="action" name="requote">&nbsp;</span>';
		}
		return _mlheadhtml;
	}

	mlhead.init = function(){
		$("body").delegate(".mlhead.tag:not(.readOnly) .action", "click", function(e){
			var $widget = $(this).parents('.tag');
			e.action = 'click';
			e.name = $(this).attr('name');
			e.$widget = $widget;
			return utils.custom.execute($widget, e);
		});
		$("body").delegate(".mlhead.tag:not(.readOnly) input", "change", function(e){
			var $this = $(this);
			var $widget = $this.parents('.tag');
			e.action = 'change';
			e.name = $this.attr('name');
			$widget.data(e.name ,$this.val())
			e.$widget = $widget;
			return utils.custom.execute($widget, e);
		});
	};
	mlhead.getValue = function($widget, attr){
		return $widget.data(attr);
	};
	mlhead.setValue = function($widget, value, callOnChange){
		$widget.html(mlhead.getHTML(value))
		$widget.data(value);
		return $widget.data();
	};
})

// /Single leg quoteBox tag start here
select_namespace("utils.custom.quoteBox", function(quoteBox){

	quoteBox.tag = function(obj){
		var $tag = utils.custom._tag(obj);

		if (obj.value === undefined)
			obj.value = {};
		var _quoteBoxhtml = quoteBox.getHTML(obj.value)

		for ( var key in obj.value) {
			obj.attr['data-' + key] = obj.value[key]
		}
		$tag.append(_quoteBoxhtml);
		return $tag;
	};	
///***** Input data format for this widge******/
	// 	var twoValue = 
	//  best 	"false"
	//  delta 	"false"
	//  deltaLTamt: "500"
	//  deltaLTbs: "sell"
	//  deltaLTcur : "USD"
	//  deltaRTamt : "500"
	//  deltaRTbs : "sell"
	//  deltaRTcur : "USD"
	//  left : "true"
	//  mode : "nonEditable"
	//  notnl  	"true"
	//  notnlAmt : "500"
	//  pips : "false"
	//  pipsLT   "500"
	//  pipsRT : "500"
	//  premium : "true"
	//  premiumLTamt : "500"
	//  premiumLTcur : "USD"
	//  premiumRTamt : "500"
	//  premiumRTcur : "USD"
	//  ptm : "true"
	//  ptmAmt : "500"
	//  right : "true"
	//  stale : "false"
	//  vol : "false"
	//  volLT : "500"
	//  volRT : "500"
	//  yield : "false"
	//  yieldLT : "500"
	//  yieldRT : "500
	// 	};
	quoteBox.getHTML = function(value){
		var _value = new Object(value);
		var checkedL = _value.checkedL;
		if(checkedL === undefined) checkedL = "checked";
		var checkedR = _value.checkedR;
		if(checkedR === undefined) checkedR = "checked";
		
		if(_value.bidPremium != undefined) _value.premiumLTamt = _value.bidPremium;
		if(_value.bidPremiumCurrency != undefined) _value.premiumLTcur = _value.bidPremiumCurrency;
		if(_value.bidPips != undefined) _value.pipsLT = _value.bidPips;
		if(_value.bidVol != undefined) _value.volLT = _value.bidVol;
		if(_value.bidYield != undefined) _value.yieldLT = _value.bidYield;
		if(_value.bidDeltaPosition != undefined) _value.deltaLTbs = _value.bidDeltaPosition;
		if(_value.bidDeltaCurrency != undefined) _value.deltaLTcur = _value.bidDeltaCurrency;
		if(_value.bidDeltaForward != undefined) _value.deltaLTamt = _value.bidDeltaForward;
		if(_value.bidSpot != undefined) _value.spotLTamt = _value.bidSpot;
		
		if(_value.askPremium != undefined) _value.premiumRTamt = _value.askPremium;
		if(_value.askPremiumCurrency != undefined) _value.premiumRTcur = _value.askPremiumCurrency;
		if(_value.askPips != undefined) _value.pipsRT = _value.askPips;
		if(_value.askVol != undefined) _value.volRT = _value.askVol;
		if(_value.askYield != undefined) _value.yieldRT = _value.askYield;
		if(_value.askDeltaPosition != undefined) _value.deltaRTbs = _value.askDeltaPosition;
		if(_value.askDeltaCurrency != undefined) _value.deltaRTcur = _value.askDeltaCurrency;
		if(_value.askDeltaForward != undefined) _value.deltaRTamt = _value.askDeltaForward;
		if(_value.askSpot != undefined) _value.spotRTamt = _value.askSpot;

		if(_value.partNotional != undefined) _value.notnlAmt = _value.partNotional;
		
		_value.ptmAmt = utils.format.get("amount",{iVal : _value.ptmAmt}).dVal;

		var  _quoteBoxhtml = '<div class="left action checkBox '+checkedL+'" name="checkBoxLT">';
    		 _quoteBoxhtml = _quoteBoxhtml  +'<div class="nonEditable">';
    		 _quoteBoxhtml = _quoteBoxhtml  +'<div class="sep">&nbsp;</div>';
    		 _quoteBoxhtml = _quoteBoxhtml  +'<span class="cur"> ' +_value.premiumLTcur +'</span>';
    		 _quoteBoxhtml = _quoteBoxhtml  +'<div class="premium">';
    		 _quoteBoxhtml = _quoteBoxhtml  +'<span class="premiumAmt"> ' +_value.premiumLTamt +'</span>';
    		 _quoteBoxhtml = _quoteBoxhtml  +'</div>';
    		 _quoteBoxhtml = _quoteBoxhtml  +'<div class="pips">';
    		 _quoteBoxhtml = _quoteBoxhtml  +'<span class="pipsAmt"> ' +_value.pipsLT +'</span>';
    		 _quoteBoxhtml = _quoteBoxhtml  +'</div>';
    		 _quoteBoxhtml = _quoteBoxhtml  +'<div class="vol">';
    		 _quoteBoxhtml = _quoteBoxhtml  +'<span class="volAmt"> ' +_value.volLT +'</span>';
    		 _quoteBoxhtml = _quoteBoxhtml  +'</div>';
    		 _quoteBoxhtml = _quoteBoxhtml  +'<div class="percentage">';
    		 _quoteBoxhtml = _quoteBoxhtml  +'<span class="percentageAmt"> ' +_value.bidPremiumPercent +'</span>';
    		 _quoteBoxhtml = _quoteBoxhtml  +'</div>';
    		 _quoteBoxhtml = _quoteBoxhtml  +'<div class="yield">';
    		 _quoteBoxhtml = _quoteBoxhtml  +'<span class="yieldAmt"> ' +_value.yieldLT +'</span>';
    		 _quoteBoxhtml = _quoteBoxhtml  +'</div>';
    		 _quoteBoxhtml = _quoteBoxhtml  +'<div class="delta">';
    		 _quoteBoxhtml = _quoteBoxhtml  +'<div class="deltaLabel">' +_value.deltaLTbs +' '+ _value.deltaLTcur +' '+ _value.deltaLTamt +'</div>';
    		 _quoteBoxhtml = _quoteBoxhtml  +'<div class="spotLabel">Spot @ '+ _value.spotLTamt +'</div>';
    		 _quoteBoxhtml = _quoteBoxhtml  +'</div>'
    		 _quoteBoxhtml = _quoteBoxhtml  +'</div>';
    		 _quoteBoxhtml = _quoteBoxhtml  +'</div>';
    		 _quoteBoxhtml = _quoteBoxhtml  +'<div class="right action checkBox '+checkedR+'" name="checkBoxRT">';
    		 _quoteBoxhtml = _quoteBoxhtml  +'<div class="nonEditable">';
    		 _quoteBoxhtml = _quoteBoxhtml  +'<div class="sep">&nbsp;</div>';
    		 _quoteBoxhtml = _quoteBoxhtml  +'<span class="cur"> ' +_value.premiumRTcur +'</span>';
    		 _quoteBoxhtml = _quoteBoxhtml  +'<div class="premium">';
    		 _quoteBoxhtml = _quoteBoxhtml  +'<span class="premiumAmt"> ' +_value.premiumRTamt +'</span>';
    		 _quoteBoxhtml = _quoteBoxhtml  +'</div>';
    		 _quoteBoxhtml = _quoteBoxhtml  +'<div class="pips">';
    		 _quoteBoxhtml = _quoteBoxhtml  +'<span class="pipsAmt"> ' +_value.pipsRT +'</span>';
    		 _quoteBoxhtml = _quoteBoxhtml  +'</div>';
    		 _quoteBoxhtml = _quoteBoxhtml  +'<div class="vol">';
    		 _quoteBoxhtml = _quoteBoxhtml  +'<span class="volAmt"> ' +_value.volRT +'</span>';
    		 _quoteBoxhtml = _quoteBoxhtml  +'</div>';
    		 _quoteBoxhtml = _quoteBoxhtml  +'<div class="percentage">';
    		 _quoteBoxhtml = _quoteBoxhtml  +'<span class="percentageAmt"> ' +_value.askPremiumPercent +'</span>';
    		 _quoteBoxhtml = _quoteBoxhtml  +'</div>';
    		 _quoteBoxhtml = _quoteBoxhtml  +'<div class="yield">';
    		 _quoteBoxhtml = _quoteBoxhtml  +'<span class="yieldAmt"> ' +_value.yieldRT +'</span>';
    		 _quoteBoxhtml = _quoteBoxhtml  +'</div>';
    		 _quoteBoxhtml = _quoteBoxhtml  +'<div class="delta">';
    		 _quoteBoxhtml = _quoteBoxhtml  +'<div class="deltaLabel">' +_value.deltaRTbs +' '+ _value.deltaRTcur +' '+ _value.deltaRTamt +'</div>';
    		 _quoteBoxhtml = _quoteBoxhtml  +'<div class="spotLabel">Spot @ '+ _value.spotRTamt +'</div>';
    		 _quoteBoxhtml = _quoteBoxhtml  +'</div>'
    		 _quoteBoxhtml = _quoteBoxhtml  +'</div>';
    		 _quoteBoxhtml = _quoteBoxhtml  +'</div>';
    		 _quoteBoxhtml = _quoteBoxhtml  +'<div class="cl"></div>';
    		 _quoteBoxhtml = _quoteBoxhtml  +'<div class="nonEditableMiddle">'
    		 _quoteBoxhtml = _quoteBoxhtml  +'<div class="ptm common">';
    		 _quoteBoxhtml = _quoteBoxhtml  +'<span class="ptmLabel">PTM</span>';
    		 _quoteBoxhtml = _quoteBoxhtml  +'<span class="ptmField"> ' +_value.ptmAmt +'</span>';
    		 _quoteBoxhtml = _quoteBoxhtml  +'</div>';
    		 _quoteBoxhtml = _quoteBoxhtml  +'<div class="notnl common">';
    		 _quoteBoxhtml = _quoteBoxhtml  +'<span class="notnlLabel">Notnl.</span>';
    		 _quoteBoxhtml = _quoteBoxhtml  +'<span class="notnlField"> ' +_value.notnlAmt +'</span>';
    		 _quoteBoxhtml = _quoteBoxhtml  +'</div>';
    		 _quoteBoxhtml = _quoteBoxhtml  +'</div>';
		return _quoteBoxhtml;
	}

	quoteBox.init = function(){
		$("body").delegate(".quoteBox.tag:not(.readOnly) .action", "click", function(e){
			var $widget = $(this).parents('.tag');
			e.action = 'click';
			e.name = $(this).attr('name');
			e.$widget = $widget;
			return utils.custom.execute($widget, e);
		});
		$("body").delegate(".quoteBox.tag:not(.readOnly) input", "change", function(e){
			var $this = $(this);
			var $widget = $this.parents('.tag');
			e.action = 'change';
			e.name = $this.attr('name');
			$widget.data(e.name ,$this.val())
			e.$widget = $widget;
			return utils.custom.execute($widget, e);
		});
	};
	quoteBox.getValue = function($widget, attr){
		return $widget.data(attr);
	};
	quoteBox.setValue = function($widget, value, callOnChange){
		$widget.html(quoteBox.getHTML(value))
		$widget.data(value);
		return $widget.data();
	};
});