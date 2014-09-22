utils.define('utils.template', function(template,_in_) {
	
	template.PENDING_TEMP = {};
	//template.Q = utils.queue();
	
	//For backword compatibility
	template.define = function(tname,cb){
		return utils.defin
		e(tname).extend('utils.abstracts.template').as(cb);
	};
	template.load = function(obj){
		return utils.require(obj.name).instance(obj);
	};
	
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
	
	template.load2 = function(_OBJ,arg0,arg1,arg2,arg3,arg4) {
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
	template.loadHTML2 = function(obj) {
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