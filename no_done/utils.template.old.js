utils.define('utils.template', function(template) {
	//all the variables defined
	template.RCLASS = /[\t\r\n\f]/g;
	var RX_PATH = "rx-path";
	var RX_CHANGE = "rx-change";
	var RX_CLICK = "rx-click";
	var RX_KEYPRESS = "rx-keypress";
	var RX_KEYUP = "rx-keyup";
	template.TAG_CLASS = 'tag';
	template.TEMPLATES = {};
	template.HTML_CACHE = {};
	template.PENDING_TEMP = {};
	template.Q = utils.queue();
	
	var TemplateODO = function(cb,_data_) {
		var tempODO = new ODO(_data_);
		tempODO.content = {};
		tempODO.tags = {};
		tempODO.display = {};
		// console.log('==',TEMP,TEMP.content)
		tempODO.tracker = cb || function(e, elem) {};
		return tempODO;
	};
	
	template.define = function(temp, initCB) {
		return this.TEMPLATES[temp] = initCB;
	};
	
	template.subEvent = function(TEMP,tempODO){
		TEMP.ODO = tempODO;
		tempODO.sub('*', function(dEvent, b, c, e, THIS) {
			var elem;
			if (this.content[dEvent.path]) {
				for(var i in this.content[dEvent.path]){
					elem = this.content[dEvent.path][i];
					if(TEMP.formatter(elem.getAttribute('formatter'),elem,dEvent.value)==undefined){
						if(elem.tagName=='INPUT' || elem.tagName=='SELECT'){
							elem.value = dEvent.value
						} else elem.innerHTML = dEvent.value;						
					}
				}			
			} if (this.tags[dEvent.path]) {
				for(var i in this.tags[dEvent.path]){
					elem = this.tags[dEvent.path][i];
					if(TEMP.formatter(elem.getAttribute('formatter'),elem,dEvent.value)==undefined){
						$(elem).setValue(dEvent.value);
					}
				}
			}  if(this.display[dEvent.path]){
				for(var i in this.display[dEvent.path]){
					elem = this.display[dEvent.path][i];
					if(TEMP.formatter(elem.getAttribute('formatter'),elem,dEvent.value)==undefined){
						if(value){
							$(elem).addClass('dn')
						} else removeClass('dn')
					}
				}
			}
		});
		return tempODO;
	}
	template.bindDom = function(TEMP,tempODO) {
		$("[" + RX_PATH + "]", tempODO.$HTML).each(function() {
			var $this = this, param = $this.getAttribute(RX_PATH);
			if ((" " + $this.className + " ").replace(template.rClass," ").indexOf(template.TAG_CLASS) >= 0) {
				tempODO.tags[param] = tempODO.tags[param] || [];
				tempODO.tags[param].push(this);
			} else{
				tempODO.content[param] = tempODO.content[param] || [];
				tempODO.content[param].push(this);
			}
		});
	};
	template.addEvents = function(TEMP,tempODO,$HTML) {
		template.bindDom(TEMP,tempODO);
		TEMP.$div.on('click','['+RX_CLICK+']:not(.disabled),.tag.button:not(.disabled)',function(e){
			var $input = $(this);
			var fieldType = $input.attr('name') || $input.attr('fieldType');
			var onClickFunction = $input.attr('onClick') || $input.attr(RX_CLICK) ;
			return TEMP.node_onclick && TEMP.node_onclick(fieldType,onClickFunction,e,this);
		});
		TEMP.$div.on('change',
			':not(.tag) input['+RX_PATH+']:not(.readOnly),:not(.tag) input['+RX_CHANGE+']:not(.readOnly)',function(e){
			var $input = $(this);
			if(!$input.hasClass('disabled')){
				var uE = new utils.custom.event('change', $input, {});
				uE.fieldType =  $input.attr('name') || $input.attr('fieldType');
				uE.rx.path = $input.attr(RX_PATH);
				uE.rx.change = $input.attr(RX_CHANGE);
				return TEMP.tag_onchange && TEMP.tag_onchange(uE,e);
			}
		});
		TEMP.$div.on('keypress','['+RX_KEYPRESS+']',function(e){
			var $input = $(this);
			var uE = new utils.custom.event('keypress', $input, {});
			uE.fieldType =  $input.attr('name') || $input.attr('fieldType');
			uE.rx.path = $input.attr(RX_PATH);
			uE.rx.keypress = $input.attr(RX_KEYPRESS);
			return TEMP.tag_onkeypress && TEMP.tag_onkeypress(uE,e);
		});
		TEMP.$div.on('keyup','['+RX_KEYUP+']',function(e){
			var $input = $(this);
			var uE = new utils.custom.event('keyup', $input, {});
			uE.fieldType =  $input.attr('name') || $input.attr('fieldType');
			uE.rx.path = $input.attr(RX_PATH);
			uE.rx['keyup'] = $input.attr(RX_KEYUP);
			return TEMP.tag_onkeypress && TEMP.tag_onkeypress(uE,e);
		});
		
		TEMP.$div.on('_onchange_',function(e,uE){
			uE.fieldType =  uE.$widget.attr('name') || uE.$widget.attr('fieldType');
			uE.rx.path = uE.$widget.attr(template.RX_PATH);
			uE.rx.change = uE.$widget.attr(template.RX_CHANGE);
			return TEMP.tag_onchange && TEMP.tag_onchange(uE,e);
		});
		return tempODO;
	};
	
	template.Template  = function Template(OBJ){
		this.setOptions = function(_OBJ){
			this.__isTemp__ = true;
			this.__isready__ = false;
			for(var i in _OBJ){
				this[i]= _OBJ[i];
			}
			this.data = this.data || {};
		};
		this.setOptions(OBJ);
		
		this.ODO = template.subEvent(this,new TemplateODO(OBJ.tracker,OBJ._data_));
		this.onReady = function(cb){
			this.__onready__ = cb;
			if(this.__isready__ && this.__onready__) {
				this.__onready__();
			}
			return this;
		};
		this.find = this.query = this.$ = function(a,b){
			return $(a, b || this.$div);
		};
		this.sub = function(path,a,b,c,d,e) {
			if(!this.ODO.SLAVE) this.ODO.initSlave();
			this.ODO.SLAVE.sub(path,a,b,c,d,e);
			return this.ODO.sub(path,a,b,c,d,e);
		};
		this.on = function(path,a,b,c,d,e){
			this.__cb__ = this.__cb__ || [];
			this.__cb__.push({
				path : path,a :a, b : b, c: c, d :d,e:e
			})
		};
		this.updateData = this.update= function(obj) {
			return this.ODO.update(obj);
		};
		this.change = this.changeValue = this.change = function(key, value) {
			this.ODO.change(key, value);
			return this.ODO.SLAVE.change(key, value);
		};
		this.set = function(key, value) {
			return this.ODO.change(key, value);
		};
		this.get = function(key) {
			var value = this.ODO.get(key);
			if(value==undefined){
				value = $("["+RX_PATH+"='" + key + "']", this.ODO.$HTML).getValue();
			}
			return value;
		};
		//DOM FUNCTIONS
		this.$path = function(key) {
			return $(this.ODO.content[key]).add(this.ODO.tags[key]);
		}
		this.$ = function(selector) {
			return $(selector, this.ODO.$HTML);
		};
		this.dismiss = function(){
			if(this.onClose) this.onClose();
			if(this.$div) this.$div.remove();
			if(this.$overlay){
				this.$overlay.remove();
				delete this.$overlay;
			}
		};
		this.reload = function(__OBJ){
			var _OBJ = __OBJ || {};
			this.parent = this._parent;
			this.__reloading__ = true;
			this._$div = this.$div; this.$div =null;
			this.setOptions(_OBJ);
			template.load(this);
		};
		//ODO OBJECTS & EVENTS
		this.formatter = function(formatterName,elem,value) {
			if(formatterName && this[formatterName]) return this[formatterName](elem,value);
		};
		this.node_onclick = function(fieldType,clickFunction,e,elem) {
			e.fieldType = fieldType;
			if(this[fieldType+"_onclick"]) return this[fieldType+"_onclick"](e,elem);
			e.clickFunction = clickFunction;
			if(this[clickFunction]) return this[clickFunction](e,elem);
		};
		this.tag_onkeypress = function(uE,e) {
			var eventName = uE.name;
			if(uE.rx[eventName]){
				if(this[uE.rx[eventName]]) return this[uE.rx[eventName]](uE,e);
			}
			if(uE.fieldType && this[uE.fieldType+"_on"+eventName]){
				return this[uE.fieldType+"_on"+eventName](uE,e);
			} else if(this['_on'+eventName]) return this['_on'+eventName](uE,e);
		};
		this.tag_onchange = function(uE,e) {
			if(uE.rx.path){
				if(this.ODO.SLAVE) this.ODO.SLAVE.change(uE.rx.path, uE.$widget.getValue());
				else this.ODO.set(uE.rx.path, uE.$widget.getValue());
			}
			if(uE.rx.change){
				if(this[uE.rx.change]) return this[uE.rx.change](uE,e);
			}
			if(uE.fieldType && this[uE.fieldType+"_onchange"]){
				return this[uE.fieldType+"_onchange"](uE,e);
			} else if(this._onchange) return this._onchange(uE,e);
		};
	}
	
	template.$div_onready = function(OBJ,$div) {
		if(OBJ._$div){
			if(OBJ.__reloading__) OBJ._$div.remove();
			delete OBJ._$div;
		}
		OBJ.$div = $div;
		if(OBJ.isModal){
			OBJ.$overlay = OBJ.$overlay || $('<div class="modal-backdrop fade in"/>');
			OBJ.$div.addClass('modal fade in').show();
		}
		if (OBJ.replace && OBJ._parent)
			OBJ._parent.html(OBJ.$div).append(OBJ.$overlay);
		else if (OBJ._parent)
			OBJ._parent.append(OBJ.$div).append(OBJ.$overlay);
		OBJ.ODO = utils.template.addEvents(OBJ,OBJ.ODO,OBJ.$div, OBJ.tracker,OBJ._data_);
		
		OBJ.on = function(eNameSel,eSelFun,eFun,c,d,e){
			if(eFun!==undefined && typeof(eFun)=='function'){
				return this.$HTML.on(eNameSel,eSelFun,eFun,c,d,e);
			} else if(eSelFun!==undefined && typeof(eSelFun)=='function'){
				return this.$HTML.on('change', eNameSel,eSelFun,eFun,c,d,e);
			}
		};
		
		if(OBJ.__cb__){
			for(var i in OBJ.__cb__){
				var _x_ = OBJ.__cb__[i];
				OBJ.on(_x_.path,_x_.a,_x_.b,_x_.c,_x_.d,_x_.e)
			}
			OBJ.__cb__ = null;
		}
		if (OBJ.onload)
			OBJ.onload();
		if(OBJ.__onready__) OBJ.__onready__();
		OBJ.__isready__ = true;
		delete template.PENDING_TEMP[OBJ.template];
		var nextOBJ = template.Q.get();
		if (nextOBJ) {
			template._load(nextOBJ);
		}
	};
});

utils.define("utils.template", function(template) {

	template.load = function(_OBJ,arg0,arg1,arg2,arg3,arg4) {
		var OBJ = new template.Template (_OBJ);
		OBJ.template = OBJ.template || OBJ.name;
		return template._load (OBJ,arg0,arg1,arg2,arg3,arg4);
	};
	template._load = function(OBJ,arg0,arg1,arg2,arg3,arg4) {
		if (template.PENDING_TEMP[OBJ.template]) {
			template.Q.put(OBJ);
		} else {
			utils.require('/template/' + OBJ.template + ".js");
			if (template.TEMPLATES[OBJ.template]){
				OBJ.__tempdef__ = template.TEMPLATES[OBJ.template];
				OBJ.__tempdef__ (OBJ,arg0,arg1,arg2,arg3,arg4);
			}
			OBJ._parent = OBJ.parent || ((OBJ.$div) ? OBJ.$div.parent() : $("body"));
			delete OBJ.parent;
			if (OBJ.$div) {
				setTimeout(function(){
					return template.$div_onready(OBJ,OBJ.$div);					
				},0);
			} else {
				if (OBJ.cached && template.HTML_CACHE[OBJ.template]) {
					OBJ.$div = $(template.HTML_CACHE[OBJ.template]);
					template.$div_onready(OBJ,OBJ.$div);
				} else {
					OBJ.success = function(html, $html) {
						if (OBJ.cached)
							template.HTML_CACHE[OBJ.template] = html;
						OBJ.$div = $(html);
						template.$div_onready(OBJ,OBJ.$div);
					}
					OBJ.method = "POST";
					OBJ.HTMLType = "template";
					template.PENDING_TEMP[OBJ.template] = true;
					template.loadHTML(OBJ);
				}
			}
		}
		return OBJ;
	};
	template.DEBUG;
	template.loadHTML = function(obj) {
		if (!obj.HTMLType)
			obj.HTMLType = "html";
		if (!obj.method)
			obj.method = "GET";
		if (!obj[obj.HTMLType])
			obj[obj.HTMLType] = "index";
		$.ajax({
			datatype : "html",
			url: CONTEXT_PATH+"template/" + obj.name,
			type : obj.method,
			data : obj.data,
			success : obj.success,
			error : function(msg) {
				console.log('error', msg);
				// namespace.check401(msg);
				return null;// bigpipe.throwError(msg.statusText);
			}
		});
		return obj;
	};
});

utils.define('utils.page', function(page) {
	page.define = function(pageName,cb){
		var _page = utils.selectNamespace(pageName);
		$(function(){
			_page.$body = $('body');
			_page.find = _page.query = _page.$ = function(a,b){
				return $(a,b);
			};
			_page.on = function(selector,eName,callback,d){
				if(eName==undefined)
					return this.$body.find(selector);
				else if(callback==undefined){
					this.$body.find(selector).trigger(eName);
				}
				return this.$body.on(eName,selector,callback,d);
			};
			_page.data = utils.parse($('#page_json').attr('data-value'));
			_page.extend(cb);
			if(_page.onload) _page.onload();
	    });
		return _page;
	};
});

utils.define('utils.config', function(config) {
	config.define = function(pageName,cb){
		var _page = utils.selectNamespace(pageName);
		_page.data = utils.parse($('#page_json').attr('data-value'));
		_page.extend(cb);
		$(document).ready(function(){
			if(_page.onload) _page.onload();
	    });
		return _page;
	};
});
