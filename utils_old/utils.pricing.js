select_namespace("utils.pricing", function(pricing){
	
	/**
	 * priceMap : {
	 *	price/premium/vol/yield, unit,  spot,MF,IMF,num_days(dcd)
	 * }
	 * tradeMap{
	 * bulkItem, quote_in, currency_pair,resultCur
	 * }
	 * 
	 * callback pricing, complete
	 */
	
	
	pricing.convert = function(priceMap, tradeMap,obj,callbacks) {
		this.priceMap = priceMap;
		this.tradeMap = tradeMap;
		this.obj = obj;
		this.callbacks = callbacks;
		this.prem_percent = function() {
		this.to_premium = function() {
			var prem = {};			
			this._digital = function() {
				var asset = pricing.asset(this.tradeMap.currency_pair);
				if(this.tradeMap.resultCur == asset) {
					var spot = this.tradeMap.bulk.notional_cur==asset?1:this.priceMap.spot;
					prem.premium = this.priceMap.price*this.tradeMap.bulk.notional/(spot*100);
				} else {
					var spot = this.tradeMap.bulk.notional_cur!=asset?1:this.priceMap.spot;
					prem.premium = this.priceMap.price*this.tradeMap.bulk.notional*spot/100;
				}		
			}
			this._fx_instruments = function() {
				var asset = pricing.asset(this.tradeMap.currency_pair);
				var strike = this.tradeMap.bulk.notional_cur == asset ? 1 : this.tradeMap.bulk.strike;
				prem.premium = this.priceMap.price * this.tradeMap.bulk.notional / (strike*100);
			}
			if(["onetouch","notouch"].indexOf(this.tradeMap.bulk.option_class)>-1) {
				this._digital();		
			} else {
				this._fx_instruments();		
			}
			return prem;
		}
		this.from_premium = function() {
			var prem_per = {};				
			this._digital = function() {
				var asset = pricing.asset(this.tradeMap.currency_pair);
				if(this.tradeMap.resultCur == asset) {
					var spot = this.tradeMap.bulk.notional_cur==asset?1:this.priceMap.spot;
					prem_per.prem_percent = this.priceMap.premium*100*spot/this.tradeMap.bulk.notional;
				} else {
					var spot = this.tradeMap.bulk.notional_cur!=asset?1:this.priceMap.spot;
					prem_per.prem_percent = this.priceMap.premium*100/(this.tradeMap.bulk.notional*spot);
				}
			}				
			this._fx_instruments = function() {
				var asset = pricing.asset(this.tradeMap.currency_pair);
				var strike = this.tradeMap.bulk.notional_cur == asset ? 1 : this.tradeMap.bulk.strike;
				prem_per.prem_percent =  this.priceMap.premium *100* strike / (this.tradeMap.bulk.notional);
			}					
			
			if(["onetouch","notouch"].indexOf(this.tradeMap.bulk.option_class)>-1) {				
				this._digital();		
			} else {
				this._fx_instruments();		
			}
			return prem_per;
		}
		return this;
		}

		//	Premium = Pips x Notional in Asset Currency /Multiplying Factor
		//	Premium in Asset Currency = Pips x Notional in Numeraire Currency / Multiplying Factor
		this.pips = function() {
			this.to_premium = function() {
				var premium = 0;
				var numerar = pricing.numerar(this.tradeMap.currency_pair);
				var asset = pricing.asset(this.tradeMap.currency_pair);
				// Calculation with strike
				if(this.tradeMap.bulk.strike != undefined || this.tradeMap.bulk.strike != null) {
					if(this.tradeMap.resultCur == numerar) {
						var strike = this.tradeMap.bulk.notional_cur == asset ? 1 : this.tradeMap.bulk.strike;
						return {premium : this.priceMap.pips * this.tradeMap.bulk.notional / (strike*this.priceMap.MF)};	
					} else {
						var strike = this.tradeMap.bulk.notional_cur == numerar ? 1 : this.tradeMap.bulk.strike;
						return {premium : (this.priceMap.pips * this.tradeMap.bulk.notional *strike) / this.priceMap.IMF};	
					}
				} 
				// Calculation without strike
				else if(this.tradeMap.bulk.spotRate != undefined || this.tradeMap.bulk.spotRate != null){
					if(this.tradeMap.bulk.notional_cur == this.tradeMap.resultCur) {
						return {premium : this.priceMap.pips  * this.tradeMap.bulk.notional / (this.tradeMap.bulk.spotRate * this.priceMap.MF)};
					}
				}
			};
			this.from_premium = function() {
				var pips = 0;
				var numerar = pricing.numerar(this.tradeMap.currency_pair);
				var asset = pricing.asset(this.tradeMap.currency_pair);
				if(this.tradeMap.bulk.strike != undefined || this.tradeMap.bulk.strike != null) {
					if(this.tradeMap.resultCur == numerar) {
						var strike = this.tradeMap.bulk.notional_cur == asset ? 1 : this.tradeMap.bulk.strike;
						return {pips : this.priceMap.premium * strike*this.priceMap.MF / this.tradeMap.bulk.notional};
					} else {
						var strike = this.tradeMap.bulk.notional_cur == numerar ? 1 : this.tradeMap.bulk.strike;
						return {pips : (this.priceMap.premium *this.priceMap.IMF) / ( this.tradeMap.bulk.notional *strike)};	
					}	
				} else {
					if(this.tradeMap.bulk.notional_cur == this.tradeMap.resultCur) {
						return {premium : this.priceMap.pips * this.tradeMap.bulk.spotRate * (this.priceMap.MF / this.tradeMap.bulk.notional)};
					}
				}
			}
			return this;
		}
		
		this.vol = function() {
			this.to_premium = function() {
				var vol_premium = {};
				if(this.callbacks && this.callbacks.pricing) this.callbacks.pricing();
				this.obj.send({				
					action : "volPrem",
					askVol : this.priceMap.ask_vol/100,
					bidVol : this.priceMap.bid_vol/100
				 },{	complete : function(rep){
					 	if(this.callbacks && this.callbacks.complete) this.callbacks.complete(rep);
				 }, success : function(rep) {
					 pricing.vol_callback(rep);
				 }
				 });
			this.vol_callback = function(rep) {
			
				this.priceMap.pips = parseFloat(rep.vol.ask_pips[rep.resultCur]);	
			 	vol_premium.ask_premium = this.pips().to_premium();
			 	this.priceMap.pips = parseFloat(rep.vol.bid_pips[rep.resultCur]);	
			 	vol_premium.bid_premium = this.pips().to_premium();
			 	vol_premium.ask_delta_hedge = rep.vol.ask_delta_spot[rep.resultCur];
			 	vol_premium.bid_delta_hedge = rep.vol.bid_delta_spot[rep.resultCur];
				console.log(vol_premium);
			}			
			return vol_premium;
			}
			this.from_premium = function() {
				return null;
			}
			// Calculation of markup on change of final premium.
			this.to_markup = function() {
				return this.priceMap.final_premium - this.priceMap.original_premium;
			};
			// Calculation of final price on change of markup.
			this.from_markup = function() {
				// If markup is in %
				var markup = this.priceMap.markup;
				if(utils.indexOf(markup, "%") != -1) {
					markup = markup.substr(0, markup.indexOf("%")) - 0;
					markup = (this.priceMap.original_premium * (markup)) / 100;
				}
				return this.priceMap.original_premium + markup;
			};
			return this;
		}
		this.yield = function() {
			this.to_premium = function() {
				var interest_rate = this.tradeMap.bulk.notional*(this.priceMap.yield/100)*this.priceMap.num_days/360;
				return {premium:Number(interest_rate)};
			}
			this.from_premium  = function() {
				return {yield : this.priceMap.premium*100*360/(this.tradeMap.bulk.notional*this.priceMap.num_days)}
			}
			this.to_markup = function() {
				return {markup : (this.priceMap.finalYield - this.priceMap.originalYield) * this.priceMap.num_days * this.tradeMap.bulk.notional};
			};
			this.from_markup = function() {
				//return {yield : (this.priceMap.finalYield - this.priceMap.originalYield) * this.priceMap.num_days * this.tradeMap.bulk.notional};
			};
			return this;
		}
		this.markup_percent = function() {
			// Calculation of markup when user enters markup in %.
			this.to_markup = function() {
				return {markup : this.priceMap.premium * this.priceMap.markup / 100};
			};
			this.from_markup = function() {};
		};
		this.markup = function(){
			this.to_premium = function(){
				var markup_with_spread = 0;
				var MS = this.priceMap.spread==undefined || this.priceMap.spread==null ? this.tradeMap.spread :
					this.priceMap.spread;
				markup_with_spread = markup_with_spread - this.tradeMap.margin;
				var price = this.priceMap.price;
				if(price == null) return "";
				if(price == undefined) price = 0;

				if(MS!=null && MS!=undefined) {			
					if(this.priceMap.type != "pips") {		
						markup_with_spread =  (markup_with_spread/100)*price;
					} else {
						markup_with_spread = MS;
					} 
					if(this.priceMap.position.toLowerCase() == "ask") return (price + markup_with_spread);
						else return (price - markup_with_spread);
					}
				
				return price;
			}
			this.from_premium = function() {
				return null;
			}
			return this;
		}
		this._convert = function() {
			if(this.priceMap.premium) {
				return this[this.priceMap.unit]().from_premium();
			} else {
				return this[this.priceMap.unit]().to_premium();
			}		
		}
		return this._convert();
	}

	//-------------------clean code------------------------------------------start
	// Common calculations.
	pricing.common = {
		// Calculation of markup amount from markup %.
		to_markup_amount : function(priceMap) {
			var markup = priceMap.markup;
			// If markup is in %.
			if(utils.indexOf(markup, "%") != -1) {
				markup = markup.substr(0, markup.indexOf("%")) - 0;
				return {markup_amount : (priceMap.original_premium * markup) / 100};
			} 
			// If markup is an amount.
			else
				return {markup_amount : (markup - 0)};
		},
		// Calculation of premium on change of markup.
		to_final_premium : function(priceMap) {
			var markup_amount = pricing.common.to_markup_amount(priceMap).markup_amount;
			if(priceMap.isML){
				if (priceMap.original_premium < 0){
					return {final_premium : priceMap.original_premium - markup_amount,
						markup_amount : markup_amount};
					return {final_premium : priceMap.original_premium - markup_amount,
						markup_amount : markup_amount};
				} else {
					return {final_premium : priceMap.original_premium + markup_amount,
						markup_amount : markup_amount};
				}
			} else {
				if (priceMap.original_premium < 0){
					if(priceMap.side == "ask") {
						return {final_premium : priceMap.original_premium - markup_amount,
							markup_amount : markup_amount};
					} else {
						return {final_premium : priceMap.original_premium + markup_amount,
							markup_amount : markup_amount};
					}
				} else {
					if(priceMap.side == "bid") {
						return {final_premium : priceMap.original_premium - markup_amount,
							markup_amount : markup_amount};
					} else {
						return {final_premium : priceMap.original_premium + markup_amount,
							markup_amount : markup_amount};
					}
				}
			}
		},
		// Calculation of markup.
		to_markup : function(priceMap) {
			if(priceMap.side == "bid") {
				return {markup_amount : priceMap.original_premium - priceMap.final_premium};
			} else {
				return {markup_amount : priceMap.final_premium - priceMap.original_premium};
			}
		},
		// Distributing aggregated premium amongst legs in ML.
		get_premium_distribution : function(priceMap, tradeMap) {
			var aggregatedNotnl = 0, returnVal = [];
			for(var i = 0; i < tradeMap.bulk.length; i++)
				if(tradeMap.bulk[i].notional != undefined)
					aggregatedNotnl += (tradeMap.bulk[i].notional - 0);
				else if(tradeMap.bulk[i].payoff != undefined)
					aggregatedNotnl += (tradeMap.bulk[i].payoff - 0);
			for(var i = 0; i < tradeMap.bulk.length; i++)
				if(tradeMap.bulk[i].notional != undefined)
					returnVal[i] = (tradeMap.bulk[i].notional / aggregatedNotnl) * priceMap.final_premium;
				else if(tradeMap.bulk[i].payoff != undefined)
					returnVal[i] = (tradeMap.bulk[i].payoff / aggregatedNotnl) * priceMap.final_premium;
			return {premium_distribution : returnVal};
		},
		// Calculation of markup % from markup.
		to_markup_percent_from_markup : function(priceMap) {
			return {markup_percent : priceMap.markup / priceMap.original_premium * 100};
		}
	}
	
	// Calculations related to vol.
	pricing.volParams = {
		// Calculation of final vol % on change of markup.
		to_final_vol : function(priceMap) {
			var markup_amount = pricing.common.to_markup_amount(priceMap).markup_amount;
			var markup_percent = pricing.common.to_markup_percent_from_markup({markup : markup_amount, original_premium : priceMap.original_premium}).markup_percent;
			if(priceMap.side == "bid")
				return {final_vol : priceMap.original_vol * (1 - (markup_percent / 100)),
					markup_amount : markup_amount};
			else
				return {final_vol : priceMap.original_vol * (1 + (markup_percent / 100)),
					markup_amount : markup_amount};		
		},
		// Calculation of markup % on change of final vol %.
		to_markup_percent_from_vol : function(priceMap) {
			var markup_percent;
			if(priceMap.side == "bid") {
				markup_percent = 1 - priceMap.final_bid_vol / priceMap.original_bid_vol;
			} else {
				markup_percent = priceMap.final_bid_vol / priceMap.original_bid_vol - 1;
			}
			return {markup_percent : (markup_percent * 100) + "%"};
		}
	};
	
	// Calculations related to yield.
	pricing.yieldParams = {
			// Calculation of original yield from option premium, depo rate.
			to_original_yield : function(priceMap) {
				var adjusted_depo_rate = (priceMap.depo_rate / 100) * priceMap.day_count_fraction_accrual / priceMap.day_count_fraction_zero;
				return {original_yield : ((priceMap.option_premium / 100) * (1 + adjusted_depo_rate * priceMap.day_count_fraction_accrual) + adjusted_depo_rate) * 100};
			},
			// Calculation of final yield from original yield & markup. 
			to_final_yield : function(priceMap, tradeMap) {
				var markup_amount = pricing.common.to_markup_amount(priceMap).markup_amount;
				var annualized_markup = markup_amount / tradeMap.bulk.notional / priceMap.day_count_fraction_accrual;
				if(priceMap.side == "bid") {
				return {final_yield : ((priceMap.original_yield / 100) * (1 - annualized_markup)) * 100,
					markup_amount : markup_amount};
				} else {
					return {final_yield : ((priceMap.original_yield / 100) * (1 + annualized_markup)) * 100,
						markup_amount : markup_amount};
				}
			},
			// Calculation of markup on change of final yield %.
			to_markup : function(priceMap, tradeMap) {
				if(priceMap.side == "bid") {
					return {markup_amount : (priceMap.original_yield - priceMap.final_yield) * priceMap.day_count_fraction_accrual * tradeMap.bulk.notional};
				} else {
					return {markup_amount : (priceMap.final_yield - priceMap.original_yield) * priceMap.day_count_fraction_accrual * tradeMap.bulk.notional};
				}
			},
			// Calculation of final premium on change of OP %.
			to_final_premium : function(priceMap, tradeMap) {
				return {final_premium : priceMap.option_premium * priceMap.day_count_fraction_accrual * tradeMap.bulk.notional};
			}
		};
	
	// Calculations related to pips.
	pricing.pipsParams = {
		to_final_premium : function(priceMap, tradeMap) {
			var numerar = pricing.numerar(tradeMap.currency_pair);
			var asset = pricing.asset(tradeMap.currency_pair);
			// Calculation with strike
			if(tradeMap.bulk.strike != undefined || tradeMap.bulk.strike != null) {
				if(tradeMap.resultCur == numerar) {
					var strike = tradeMap.bulk.notional_cur == asset ? 1 : tradeMap.bulk.strike;
					return {final_premium : priceMap.pips * tradeMap.bulk.notional / (strike * priceMap.MF)};	
				} else {
					var strike = tradeMap.bulk.notional_cur == numerar ? 1 : tradeMap.bulk.strike;
					return {final_premium : (priceMap.pips * tradeMap.bulk.notional * strike) / priceMap.IMF};	
				}
			} 
			// Calculation without strike
			else if(tradeMap.bulk.spotRate != undefined || tradeMap.bulk.spotRate != null){
				if(tradeMap.bulk.notional_cur == tradeMap.resultCur) {
					return {final_premium : priceMap.pips  * tradeMap.bulk.notional / (tradeMap.bulk.spotRate * priceMap.MF)};
				}
			}
		},
		to_final_pips : function(priceMap, tradeMap) {
			var numerar = pricing.numerar(tradeMap.currency_pair);
			var asset = pricing.asset(tradeMap.currency_pair);
			// Calculation with strike
			if(tradeMap.bulk.strike != undefined || tradeMap.bulk.strike != null) {
				if(tradeMap.resultCur == numerar) {
					var strike = tradeMap.bulk.notional_cur == numerar ? tradeMap.bulk.strike : 1;
					return {final_pips : priceMap.final_premium * strike * priceMap.MF / tradeMap.bulk.notional};
				} else {
					var strike = tradeMap.bulk.notional_cur == asset ? tradeMap.bulk.strike : 1;
					return {final_pips : (priceMap.final_premium * priceMap.IMF) / ( tradeMap.bulk.notional * strike)};	
				}	
			} 
			// Calculation without strike
			else {
				if(tradeMap.bulk.notional_cur == tradeMap.resultCur) {
					return {final_pips : priceMap.final_premium * tradeMap.bulk.spotRate * (priceMap.MF / tradeMap.bulk.notional)};
				}
			}
		}
	};
	// Calculations related to premium percent.
	pricing.premiumPercentParams = {
		// Calculation of final premium percent.
		to_final_premium_percent : function(priceMap, tradeMap) {
			var numerar = pricing.numerar(tradeMap.currency_pair);
			var asset = pricing.asset(tradeMap.currency_pair);
			// Calculation with strike
			if(tradeMap.bulk.strike != undefined || tradeMap.bulk.strike != null) {
				if(tradeMap.resultCur == numerar) {
					var strike = tradeMap.bulk.notional_cur == numerar ? tradeMap.bulk.strike : 1;
					return {final_premium_percent : priceMap.final_premium / tradeMap.bulk.notional * strike};	
				} else {
					var strike = tradeMap.bulk.notional_cur == asset ? tradeMap.bulk.strike : 1;
					return {final_premium_percent : priceMap.final_premium / (tradeMap.bulk.notional / strike)};	
				}
			} 
			// Calculation without strike
			else if(tradeMap.bulk.spotRate != undefined || tradeMap.bulk.spotRate != null){
				if(tradeMap.resultCur == numerar) {
					var strike = tradeMap.bulk.payoff_cur == asset ? tradeMap.bulk.strike : 1;
					return {final_premium_precent : priceMap.final_premium / tradeMap.bulk.payoff * strike};	
				} else {
					var spot_rate = tradeMap.bulk.payoff_cur == numerar ? tradeMap.bulk.spotRate : 1;
					return {final_premium_precent : priceMap.final_premium / (tradeMap.bulk.payoff / spot_rate)};	
				}
			}
		},
		// Calculation of markup %.
		to_markup_percent : function(priceMap, tradeMap) {
			if(priceMap.side == "bid") {
				return {markup_percent : priceMap.original_premium_percent * (1 - markup_percent)};
			} else {
				return {markup_percent : priceMap.original_premium_percent * (1 + markup_percent)};
			}
		},
		// Calculation of final premium.
		to_final_premium : function(priceMap, tradeMap) {
			var numerar = pricing.numerar(tradeMap.currency_pair);
			var asset = pricing.asset(tradeMap.currency_pair);
			// Calculation with strike
			if(tradeMap.bulk.strike != undefined || tradeMap.bulk.strike != null) {
				if(tradeMap.resultCur == numerar) {
					var strike = tradeMap.bulk.notional_cur == numerar ? tradeMap.bulk.strike : 1;
					return {final_premium : priceMap.final_premium_percent * tradeMap.bulk.notional * strike};	
				} else {
					var strike = tradeMap.bulk.notional_cur == asset ? tradeMap.bulk.strike : 1;
					return {final_premium : priceMap.final_premium_percent * (tradeMap.bulk.notional / strike)};	
				}
			} 
			// Calculation without strike
			else if(tradeMap.bulk.spotRate != undefined || tradeMap.bulk.spotRate != null){
				if(tradeMap.resultCur == numerar) {
					var strike = tradeMap.bulk.payoff_cur == asset ? tradeMap.bulk.strike : 1;
					return {final_premium : priceMap.final_premium_percent * tradeMap.bulk.payoff * strike};	
				} else {
					var spot_rate = tradeMap.bulk.payoff_cur == numerar ? tradeMap.bulk.spotRate : 1;
					return {final_premium : priceMap.final_premium_percent * (tradeMap.bulk.payoff / spot_rate)};	
				}
			}
		}
	};
	//-------------------clean code------------------------------------------end
	
	pricing.asset = function(currency_pair) {
		return currency_pair.substr(0,3);
	};
	
	pricing.numerar = function(currency_pair) {
		return currency_pair.substr(3);
	};
	
	pricing.rounded_off_price = function(value,unit){
		if(value==null || value==undefined) {
			return "";
		}
		if(unit =="vol") {
			return pricing.roundoff(value,12,0,2);
		} else if(unit =="%") {
			return pricing.roundoff(value,12,0,3);
		} else if(unit=="pips") {
			return pricing.roundoff(value,12,0,0);
		}
		return value;
	};
	pricing.roundoff = function(value,l,r,d) {
		var val = utils.math.round(value,d);
		if(val==null || val == undefined || isNaN(val)) {
			return "";
		}
		return val;
	};
	
	
	/**
	 * Test Case
	 */
	pricing.test = function() {
		// premum_percent to premium (asset == notional_cur)
		console.log(pricing.convert({
			price : 12,
			unit : "prem_percent",
			spot : 104,
			MF : 100,
			IMF : 10000,
			num_days : 60
			},{
			bulk : {
				option_class : "euvanilla",
				notional : 1000000,
				notional_cur : "USD",
				strike : 104
			},
			quote_in : "price",
			currency_pair : "USDJPY",
			resultCur : "USD"
		}));
		
		// premum to premium_percent (asset == notional_cur)
		console.log(pricing.convert({
			premium : 120000,
			unit : "prem_percent",
			spot : 104,
			MF : 100,
			IMF : 10000,
			num_days : 60
			},{
			bulk : {
				option_class : "euvanilla",
				notional : 1000000,
				notional_cur : "USD",
				strike : 104
			},
			quote_in : "price",
			currency_pair : "USDJPY",
			resultCur : "USD"
		}));

		//premum_percent to premium (numerar == notional_cur)
		console.log(pricing.convert({
			price : 12,
			unit : "prem_percent",
			spot : 104,
			MF : 100,
			IMF : 10000,
			num_days : 60
			},{
			bulk : {
				option_class : "euvanilla",
				notional : 1000000,
				notional_cur : "JPY",
				strike : 104
			},
			quote_in : "price",
			currency_pair : "USDJPY",
			resultCur : "USD"
		}));
		
		//premum to premium-percent (numerar == notional_cur)
		console.log(pricing.convert({
			premium : 1153.8461538461538,
			unit : "prem_percent",
			spot : 104,
			MF : 100,
			IMF : 10000,
			num_days : 60
			},{
			bulk : {
				option_class : "euvanilla",
				notional : 1000000,
				notional_cur : "JPY",
				strike : 104
			},
			quote_in : "price",
			currency_pair : "USDJPY",
			resultCur : "USD"
		}));
		
		// premum_percent to premium (resultCur = asset option_class = digital asset == notional_cur)
		console.log(pricing.convert({
			price : 12,
			unit : "prem_percent",
			spot : 104,
			MF : 100,
			IMF : 10000,
			num_days : 60
			},{
			bulk : {
				option_class : "onetouch",
				notional : 1000000,
				notional_cur : "USD"
			},
			quote_in : "price",
			currency_pair : "USDJPY",
			resultCur : "USD"
		}));
		
		// premum to premium_percent (resultCur = asset asset == notional_cur,option_class = digital)
		console.log(pricing.convert({
			premium : 120000,
			unit : "prem_percent",
			spot : 104,
			MF : 100,
			IMF : 10000,
			num_days : 60
			},{
			bulk : {
				option_class : "onetouch",
				notional : 1000000,
				notional_cur : "USD"
			},
			quote_in : "price",
			currency_pair : "USDJPY",
			resultCur : "USD"
		}));
		
		// premum_percent to premium (resultCur = numerar asset == notional_cur, option_class = digital)
		console.log(pricing.convert({
			price : 12,
			unit : "prem_percent",
			spot : 104,
			MF : 100,
			IMF : 10000,
			num_days : 60
			},{
			bulk : {
				option_class : "onetouch",
				notional : 1000000,
				notional_cur : "USD"
			},
			quote_in : "price",
			currency_pair : "USDJPY",
			resultCur : "JPY"
		}));
		
		// premum to premium_percent (resultCur = numerar asset == notional_cur option_class = digital)
		console.log(pricing.convert({
			premium : 	12480000,
			unit : "prem_percent",
			spot : 104,
			MF : 100,
			IMF : 10000,
			num_days : 60
			},{
			bulk : {
				option_class : "onetouch",
				notional : 1000000,
				notional_cur : "USD"
			},
			quote_in : "price",
			currency_pair : "USDJPY",
			resultCur : "JPY"
		}));
		
		//premum_percent to premium (resultCur = asset numerar == notional_cur option_class = digital)
		console.log(pricing.convert({
			price : 12,
			unit : "prem_percent",
			spot : 104,
			MF : 100,
			IMF : 10000,
			num_days : 60
			},{
			bulk : {
				option_class : "onetouch",
				notional : 1000000,
				notional_cur : "JPY",
				strike : 104
			},
			quote_in : "price",
			currency_pair : "USDJPY",
			resultCur : "USD"
		}));
		
		//premum to premium-percent (resultCur = asset numerar == notional_cur option_class = digital)
		console.log(pricing.convert({
			premium : 1153.8461538461538,
			unit : "prem_percent",
			spot : 104,
			MF : 100,
			IMF : 10000,
			num_days : 60
			},{
			bulk : {
				option_class : "onetouch",
				notional : 1000000,
				notional_cur : "JPY",
				strike : 104
			},
			quote_in : "price",
			currency_pair : "USDJPY",
			resultCur : "USD"
		}));
		
		//premum_percent to premium (resultCur = numerar numerar == notional_cur option_class = digital)
		console.log(pricing.convert({
			price : 12,
			unit : "prem_percent",
			spot : 104,
			MF : 100,
			IMF : 10000,
			num_days : 60
			},{
			bulk : {
				option_class : "onetouch",
				notional : 1000000,
				notional_cur : "JPY",
				strike : 104
			},
			quote_in : "price",
			currency_pair : "USDJPY",
			resultCur : "JPY"
		}));
		
		//premum to premium-percent (resultCur = numerar numerar == notional_cur option_class = digital)
		console.log(pricing.convert({
			premium : 120000,
			unit : "prem_percent",
			spot : 104,
			MF : 100,
			IMF : 10000,
			num_days : 60
			},{
			bulk : {
				option_class : "onetouch",
				notional : 1000000,
				notional_cur : "JPY",
				strike : 104
			},
			quote_in : "price",
			currency_pair : "USDJPY",
			resultCur : "JPY"
		}));
		
		//pips to premium (resultCur = numerar numerar == notional_cur)
		console.log(pricing.convert({
			pips : 12,
			unit : "pips",
			spot : 104,
			MF : 100,
			IMF : 10000,
			num_days : 60
			},{
			bulk : {
				option_class : "euvanilla",
				notional : 1000000,
				notional_cur : "JPY",
				strike : 104
			},
			quote_in : "price",
			currency_pair : "USDJPY",
			resultCur : "JPY"
		}));
		
		//premum to pips (resultCur = numerar numerar == notional_cur)
		console.log(pricing.convert({
			premium : 1153.8461538461538,
			unit : "pips",
			spot : 104,
			MF : 100,
			IMF : 10000,
			num_days : 60
			},{
			bulk : {
				option_class : "euvanilla",
				notional : 1000000,
				notional_cur : "JPY",
				strike : 104
			},
			quote_in : "price",
			currency_pair : "USDJPY",
			resultCur : "JPY"
		}));
		
		//pips to premium (resultCur = numerar numerar == notional_cur)
		console.log(pricing.convert({
			pips : 12,
			unit : "pips",
			spot : 104,
			MF : 100,
			IMF : 10000,
			num_days : 60
			},{
			bulk : {
				option_class : "euvanilla",
				notional : 1000000,
				notional_cur : "USD",
				strike : 104
			},
			quote_in : "price",
			currency_pair : "USDJPY",
			resultCur : "JPY"
		}));
		
		//premum to pips (resultCur = numerar numerar == notional_cur)
		console.log(pricing.convert({
			premium : 120000,
			unit : "pips",
			spot : 104,
			MF : 100,
			IMF : 10000,
			num_days : 60
			},{
			bulk : {
				option_class : "euvanilla",
				notional : 1000000,
				notional_cur : "USD",
				strike : 104
			},
			quote_in : "price",
			currency_pair : "USDJPY",
			resultCur : "JPY"
		}));
		
		//pips to premium (resultCur = asset numerar == notional_cur)
		console.log(pricing.convert({
			pips : 12,
			unit : "pips",
			spot : 104,
			MF : 100,
			IMF : 10000,
			num_days : 60
			},{
			bulk : {
				option_class : "euvanilla",
				notional : 1000000,
				notional_cur : "JPY",
				strike : 104
			},
			quote_in : "price",
			currency_pair : "USDJPY",
			resultCur : "USD"
		}));
		
		//premum to pips (resultCur = asset numerar == notional_cur)
		console.log(pricing.convert({
			premium : 1200,
			unit : "pips",
			spot : 104,
			MF : 100,
			IMF : 10000,
			num_days : 60
			},{
			bulk : {
				option_class : "euvanilla",
				notional : 1000000,
				notional_cur : "JPY",
				strike : 104
			},
			quote_in : "price",
			currency_pair : "USDJPY",
			resultCur : "USD"
		}));
		
		//pips to premium (resultCur = asset numerar == notional_cur)
		console.log(pricing.convert({
			pips : 12,
			unit : "pips",
			spot : 104,
			MF : 100,
			IMF : 10000,
			num_days : 60
			},{
			bulk : {
				option_class : "euvanilla",
				notional : 1000000,
				notional_cur : "USD",
				strike : 104
			},
			quote_in : "price",
			currency_pair : "USDJPY",
			resultCur : "USD"
		}));
		
		//premum to pips (resultCur = asset numerar == notional_cur)
		console.log(pricing.convert({
			premium : 124800,
			unit : "pips",
			spot : 104,
			MF : 100,
			IMF : 10000,
			num_days : 60
			},{
			bulk : {
				option_class : "euvanilla",
				notional : 1000000,
				notional_cur : "USD",
				strike : 104
			},
			quote_in : "price",
			currency_pair : "USDJPY",
			resultCur : "USD"
		}));
		
		//yield to premium ( asset == notional_cur)
		console.log(pricing.convert({
			yield : 12,
			unit : "yield",
			spot : 104,
			MF : 100,
			IMF : 10000,
			num_days : 60
			},{
			bulk : {
				option_class : "euvanilla",
				notional : 1000000,
				notional_cur : "USD",
				strike : 104
			},
			quote_in : "yield",
			currency_pair : "USDJPY"
		}));
		
		//premum to yield (numerar == notional_cur)
		console.log(pricing.convert({
			premium : 20000,
			unit : "yield",
			spot : 104,
			MF : 100,
			IMF : 10000,
			num_days : 60
			},{
			bulk : {
				option_class : "euvanilla",
				notional : 1000000,
				notional_cur : "JPY",
				strike : 104
			},
			quote_in : "yield",
			currency_pair : "USDJPY"
		}));
	}
	
	
});


