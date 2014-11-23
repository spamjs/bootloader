/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
utils.selectNamespace('utils.format', function(format) {
    format.mapHandler = {};
    format.defMap = function OutPutMap(iVal,dVal) {
        this.iVal = iVal || '';
        this.dVal = dVal || '';
        this.isEmpty = false;
        this.isValid = true;
        this.reason = '';
    };
    format.defMap.prototype.prop = function(name, value) {
        this[name] = value;
        return this;
    };
    format.getValue = function(formatType, value, options) {
        if (formatType && this[formatType])
            return this[formatType](value, options);
        else
            return value;
    };
    format.getObject = function(formatType, options) {
        if (formatType && this.mapHandler[formatType])
            return this.mapHandler[formatType](options);
        else {
            return new format.defMap(options.iVal ||options.dVal, options.dVal || options.iVal)
        }
    };
    format._get = function(value, options) {
        if (typeof (value) == 'object') {
            if (!value)
                return value;
            var formatType = value.formatType;
            return this.getObject(formatType, value)
        } else {
            if (!options)
                return value;
            var formatType = options.formatType;
            return this.getValue(formatType, value, options);
        }
    };
    format.get = function(formatType, value, options) {
        if (typeof (value) == 'object') {
            return this.getObject(formatType, value);
        } else
            return this.getValue(formatType, value, options);
    };
    format.set = function(formatType, handler, mapHandler) {
        this[formatType] = handler;
        this.mapHandler[formatType] = mapHandler;
    };
    format.hasMap = function(formatType) {
        if (this.mapHandler[formatType])
            return true;
        return false;
    }
});