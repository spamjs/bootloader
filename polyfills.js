if (typeof Object.getPrototypeOf !== "function") {
	if (typeof "test".__proto__ === "object") {
		Object.getPrototypeOf = function(object) {
			return object.__proto__;
		};
	} else {
		Object.getPrototypeOf = function(object) {
			return object.constructor.prototype;
		};
	}
}
if (typeof Object.setPrototypeOf !== "function") {
	if (typeof "test".__proto__ === "object") {
		if(false && typeof Object.defineProperty=='function'){
			Object.setPrototypeOf = function(object, proto) {
				Object.defineProperty(object, 'prototype', {
					  value : proto
				});
				return proto;
			};
		} else {
			Object.setPrototypeOf = function(object, proto) {
				return object.__proto__ = proto;
			};
		}
	} else {
		Object.setPrototypeOf = function(object, proto) {
			return object.constructor.prototype = proto;
		};
	}
}
if (typeof String.prototype.endsWith !== 'function') {
	String.prototype.endsWith = function(suffix) {
		return this.indexOf(suffix, this.length - suffix.length) !== -1;
	};
}