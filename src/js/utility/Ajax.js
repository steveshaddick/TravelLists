var Ajax = (function() {

	var TIMEOUT_SECONDS = 10000;

	var token = 'none';

	var isWaiting = false;
	var timeoutWait = null;

	var request = null;
	var callback = null;
	var errorCallback = null;

	var background = [];
	var bgid = 1; //incrementor, this will break beyond max int size

	function init(_token) {
		token = _token;
	}

	function call(action, data, onSuccess, onError, isBackground) {

		isBackground = (typeof isBackground == "undefined") ? false : isBackground;

		if (typeof data === "undefined") {
			data = { token: token };
		} else {
			data.token = token;
		}
		
		if (isBackground) {
			data.bgid = bgid++;
			background.push( {
				bgid : data.bgid,
				callback : (typeof onSuccess === "undefined") ? null : onSuccess,
				errorCallback : (typeof onError === "undefined") ? null : onError
			});

		} else {
			
			if (isWaiting) return;

			callback = (typeof onSuccess === "undefined") ? null : onSuccess;
			errorCallback = (typeof onError === "undefined") ? null : onError;
			timeoutWait = setTimeout(timeout, TIMEOUT_SECONDS);
		}

		request = $.ajax({
			url: "/ajax/" + action,
			type: "POST",
			data: data,
			dataType: "json"
		});

		request.done(requestDone);
		request.fail(requestFailed);

	}

	function requestDone(data) {
		if (data && data.success) {
			if (data.bgid) {
				for (var i=background.length - 1; i>=0; i--) {
					if (background[i].bgid == data.bgid) {
						if (background[i].callback) {
							background[i].callback(data);
						}
						background.splice(i, 1);
					}
				}
			} else {
				isWaiting = false;
				request = null;
				clearTimeout(timeoutWait);
				if (callback) {
					callback(data);
					callback = null;
					errorCallback = null;
				}
			}
		} else {
			if (data && data.bgid) {
				for (var i=background.length - 1; i>=0; i--) {
					if (background[i].bgid == data.bgid) {
						if (background[i].errorCallback) {
							background[i].errorCallback(data);
						}
						background.splice(i, 1);
					}
				}
			} else {
				requestFailed();	
			}
		}
		
	}

	function requestFailed(jqXHR, textStatus) {
		//TODO bug here - if a background call errors it'll disrupt the main queue
		isWaiting = false;
		request = null;
		callback = null;
		clearTimeout(timeoutWait);
		if (errorCallback) {
			errorCallback();
			errorCallback = null;
		}
	}

	function timeout() {
		request.done(function(){});
		request.fail(function(){});
		requestFailed();
	}

	return {
		init: init,
		call: call
	};

}());