if (typeof console == "undefined") {
	console = {
		log: function() {}
	};
}

var GLOBAL = {


};

var EventDispatcher = (function() {
	
	var callbacks = [];
	
	function addEventListener(event, callback) {
		
		if (typeof callbacks[event] == "undefined") {
			callbacks[event] = [];
		}
		
		for (var i=0; i<callbacks[event].length; i++) {
			if (callbacks[event][i] == callback) {
				return;
			}
		}
		callbacks[event].push(callback);
	}
	
	function removeEventListener(event, callback) {
		
		if (typeof callbacks[event] == "undefined") return;
		
		for (var i=callbacks[event].length - 1; i>=0; i--) {
			if (callbacks[event][i] == callback) {
				callbacks[event].splice(i, 1);
			}
		}
		
		if (callbacks[event].length === 0) {
			callbacks[event] = undefined;
		}
		
	}
	
	function dispatchEvent(event, obj) {
		
		if (typeof callbacks[event] == "undefined") return;
		
		for (var i=0; i < 1; i++) {
			callbacks[event][i](obj);
		}
	}
	
	return {
		addEventListener: addEventListener,
		removeEventListener: removeEventListener,
		dispatchEvent: dispatchEvent
	};
	
}());

var Ajax = (function() {

	var TIMEOUT_SECONDS = 10000;

	var token = 'none';

	var isWaiting = false;
	var timeoutWait = null;

	var request = null;
	var callback = null;

	function init(_token) {
		token = _token;
	}

	function call(action, data, onSuccess) {

		if (isWaiting) return;

		if (typeof data === "undefined") {
			data = { token: token };
		} else {
			data.token = token;
		}

		callback = (typeof onSuccess === "undefined") ? null : onSuccess;

		request = $.ajax({
		  url: "/ajax/" + action,
		  type: "POST",
		  data: data,
		  dataType: "json"
		});

		request.done(requestDone);
		request.fail(requestFailed);

		timeoutWait = setTimeout(timeout, TIMEOUT_SECONDS);
	}

	function requestDone(data) {
		isWaiting = false;
		request = null;
		clearTimeout(timeoutWait);

		if (callback) {
			callback(data);
			callback = null;
		}
	}

	function requestFailed(jqXHR, textStatus) {
		isWaiting = false;
		request = null;
		callback = null;
		clearTimeout(timeoutWait);
	}

	function timeout() {
		request.done(function(){});
		request.fail(function(){});
		requestFailed();
	}

	return {
		init: init,
		call: call
	}

}());



var Main = (function() {
	
	
	function init(obj) {
		
		Ajax.init(obj.a);
	
	}

	
	
	return {
		init : init
	};
	
}());
