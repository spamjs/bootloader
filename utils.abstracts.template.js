utils.define('utils.abstracts.template', function(template,_instance_) {
	
	utils.require('utils.custom','utils.odo','utils.custom.tag','utils.template','utils.json');
	
	var custom = utils.require('utils.custom');
	var odo = utils.require('utils.odo');
	var tag = utils.require('utils.custom.tag');
	var _template = utils.require('utils.template');
	var json = utils.require('utils.json');

	template._instance_ = function(obj){
		if(!obj) return;
		template._create_template_(this,obj);
	};
	template._create_template_ = function(THIS,obj){
		THIS.name = this.module;
		THIS.data = odo.instance();
		var data = obj.data || {};
		delete obj.data;
		for(var prop in obj){
			THIS[prop] =  obj[prop];
		}
		if(THIS.isModal){
			THIS.$overlay = THIS.$overlay || $('<div class="modal-backdrop fade in"/>');
		}
		return template._create_template_html(THIS,data);
	};
	template._create_template_html = function(THIS,_data,cb){
		console.info(THIS)
		THIS.$parent = THIS.$parent || $('<div/>').appendTo(_template.$body);
		return _template.loadHTML(THIS,function(serverData){
			THIS._bindDomEvents_();
			THIS._bindDataEvents_();
			THIS.data.update(_data,serverData);
			if(serverData) THIS.data.update(serverData);
			if(THIS._ready_) THIS._ready_();
			if(THIS._ready__) THIS._ready__();
			if(cb) cb();
		});
	};
	_instance_.reload = function(obj){
		var obj = obj || {};
		var data = obj.data || {};
		delete obj.data;
		for(var prop in obj){
			this[prop] =  obj[prop];
		}
		var $div = this.$div; 
		this.$div =null;
		//var $overlay = this.$overlay; this.$overlay = null;
		//var isModal = this.isModal; this.isModal = false;
		var THIS = this;
		var replace = THIS.replace; THIS.replace =true; 
		//this.setOptions(_OBJ);
		return template._create_template_html(THIS,data,function(){
			//THIS.isModal = isModal;
			//THIS.$overlay = $overlay;
			THIS.replace = replace;
			$div.remove();
		});
	};
	_instance_._bindDomEvents_ = function(){
		if(this.$div){
			var THAT = this;
			THAT.$div.on(tag.EVENTS.value_change,function(e){
				var $tag = $(e.target);
				var propagate = false;
				if(!$tag.hasClass('disabled')){
					var detail = custom.getEventDetail(e);
					if(detail.isValid){
						detail.iVal = $tag.getValue();
						THAT.data.change(detail.path,detail.iVal);
						if(!(detail.method_onchange && THAT[detail.method_onchange])
								|| THAT[detail.method_onchange](detail,$tag)){
							if(!(detail.fieldType && THAT[detail.fieldType + "_onchange"])
									|| THAT[detail.fieldType + "_onchange"](detail,$tag)){
								propagate = THAT._onchange_(detail,$tag);
							}
						}
					}
				}
				if(!propagate) utils.preventPropagation(e);
			});
			THAT.$div.on(tag.EVENTS.buton_click,function(e){
				var $tag = $(e.target);
				var propagate = false;
				if(!$tag.hasClass('disabled')){
					var detail = custom.getEventDetail(e);
					if(!(detail.method_onclick && THAT[detail.method_onclick])
							|| THAT[detail.method_onclick](detail,$tag)){
						if(!(detail.fieldType && THAT[detail.fieldType + "_onclick"])
								|| THAT[detail.fieldType + "_onclick"](detail,$tag)){
							propagate = THAT._onclick_(detail,$tag);
						}
					}
				}
				if(!propagate) utils.preventPropagation(e);
			});
		}
	};
	_instance_._bindDataEvents_ = function(){
		if(this.data){
			var THAT = this;
			THAT.data.sub('*',function(dEvent, b, c, e, THIS){
				var elem, _value, isTag;
				if(dEvent.value && dEvent.value._tag_){
					 isTag = true;
				}
				$("[" + tag.ATTR.DATA_PATH + "='"+dEvent.path+"']", THAT.$div).each(function() {
					var $tag = $(this), param = $tag.attr(tag.ATTR.DATA_PATH);
					if($tag.hasClass('tag')){
						if(isTag) $tag.setData(dEvent.value);
						else $tag.setValue(dEvent.value);
					} else {
						var formatter = $tag.attr(tag.ATTR.DATA_FORMAT);
						if(formatter && THAT[formatter]){
							var __value = THAT[formatter](_value,$tag)
							if(__value!==undefined){
								_value = __value;
							}
						}
						var text = isTag ? dEvent.value.value : dEvent.value;
						$tag.setValue(text);	
					}
				});
				THAT._datachange_(dEvent,b,c,e,THIS);
			});
		}
	};
	// Properties per template instance
	_instance_.update = function(dData){
		return this.data.update(dData);
	};
	_instance_.get = function(a,b,c,d){
		return this.data.get(a,b,c,d);
	};
	_instance_._onchange_ = function(details,event){
		return false;
	};
	_instance_._onclick_ = function(details,event){
		return false;
	};
	_instance_._datachange_ = function(dPath,dValue){
		return null;
	};
	_instance_.dismiss = function(){
		if(this.onClose) this.onClose();
		if(this.$div) this.$div.remove();
		if(this.$overlay){
			this.$overlay.remove();
			delete this.$overlay;
		}
	};
	_instance_.sub = function(dPath,listner){
		if(dPath=='*') return this._datachange_ = listner;
		return this.data.sub(dPath,listner);
	};
	_instance_.compute = function(path,cb){
		return this.data.compute(path,cb);
	}
	_instance_.on = function(dPath,dPathListner,listner){
		if(dPath=='DataChange'){
			return this.sub(dPath,listner);
		} else {
			return this.$div.on(dPath, dPathListner,listner);
		}
	};
	_instance_.onReady = function(_ready_){
		this._ready__ = _ready_; return this;
	};
});