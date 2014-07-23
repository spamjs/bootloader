/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
utils.selectNamespace('utils.files', function(files) {

    files.loaded_js = [];
    files.rpath = RESOURCE_PATH || "res";
    files.context = CONTEXT_PATH || "";
    files.setContext = function(context){
    	this.context = context;
    };
    files.setResourcePath = function(path){
    	this.rpath = path;
    };
    files.loadJs = function(js){
    	files.load(this.context + this.rpath  + js);
    };
    files.load = function(js){
        $('body').append('<jscript class="client" src="' + js + '"></jscript>');
        $('head').append('<script src="' + js + '" type="text/javascript"></script>');
    };
    utils.require = function() {
        for (var i = 0; i < arguments.length; i++) {
            var js = arguments[i];
            if (!files.loaded_js[js]){
            	files.loadJs(js);
            }
            files.loaded_js[js] = js;
        }
    };

});

