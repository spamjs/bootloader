utils.define('utils.cache', function(cache) {

	var json = utils.module('utils.json');
	var localStorage = window.localStorage || utils.module('utils.cache.localStorage');
	var cacheCounter = 0;
	var defaultCache;
	
	cache.set = function(key,value){
		return defaultCache.set(key,value);
	};
	
	cache.get = function(key){
		return defaultCache.get(key);
	};
	
	cache._instance_ = function(cacheName){
		this.id = cacheName || cacheCounter++;
		this.set = function(key,value){
			return localStorage.setItem(this.id + "#" + key,json.stringify(value));
		};
		this.has = function(){
			return !!localStorage.getItem(this.id + "#"+ key);
		};
		this.get = function(key){
			return json.parse(localStorage.getItem(this.id + "#"+ key));
		};
	};
	
	cache._execute_ = function(){
		defaultCache = cache.instance();
	};
	
});

