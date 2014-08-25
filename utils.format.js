utils.define('utils.format', function(format) {
    var mapHandlerMap = {};
    format.FormatObject = function FormatObject(options) {
    	var o = options || {};
        this.iVal = options.iVal ||options.dVal || '';
        this.dVal = options.dVal || options.iVal || '';
        this.isEmpty = false;
        this.isValid = true;
        this.reason = '';
    };
    format.get = function(value, options) {
        if (value && typeof (value) == 'object') {
            var formatType = value.formatType;
            return format._get(formatType, value);
        } else {
            return format._get(value, options);
        }
    };
    format._get = function(formatType, options) {
    	var o = new format.FormatObject(options)
        if (formatType && mapHandlerMap[formatType]){
            mapHandlerMap[formatType](options,o);
        } 
        return o;
    };
    format.set = function(formatType, handler) {
        mapHandlerMap[formatType] = handler;
    };
    format.is = function(formatType){
    	return mapHandlerMap[formatType];
    }
});