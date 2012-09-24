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


var Gate = (function() {

	function showInfo() {
		$("#landingPage").addClass('pageLeft');
		$("#txtTripName").prop('disabled', true);


		$("#infoPage").removeClass('pageRight');
		$("#txtName").prop('disabled', false).focus();
		$("#txtEmail").prop('disabled', false);
	}

	function createTrip() {

		//validate

		var name = $("#txtName").val();
		var email = $("#txtEmail").val();
		var tripName = $("#txtTripName").val();

		Main.loadBlock();
		Ajax.call('createTrip',
			{
				name: name,
				email: email,
				tripName: tripName
			},
			createTripReturn
		);
	}

	function createTripReturn(data) {

		//check for success
		if (data && data.success) {
			window.location = 'http://s182233257.onlinehome.us/' + data.tripHash;
		} else {
			
		}
		

	}

	return {
		showInfo: showInfo,
		createTrip: createTrip
	}

}());


var Main = (function() {
	
	
	function init(obj) {
		
		Ajax.init(obj.a);
	
	}

	function loadBlock() {
		$("#loadBlocker").css('display', 'block');
	}
	function loadRelease() {
		$("#loadBlocker").css('display', 'none');
	}
	
	return {
		init : init,
		loadBlock: loadBlock,
		loadRelease: loadRelease
	};
	
}());
