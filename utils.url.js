utils.define('utils.url', function(url) {

	url.getParam = function (name,_url) {
	    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
	    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
	        results = regex.exec(_url || location.search);
	    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
	};
	
	url.getValueAtIndex = function (index) {
		var data = window.location.pathname.split("/");
		return (data[index]);
	};
	
});

