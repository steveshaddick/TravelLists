if (typeof console == "undefined") {
	console = {
		log: function() {}
	};
}

var GLOBAL = {
	windowHeight: 0,
	windowWidth: 0,
	mode: 'wide',
	netCom: false,
	transitionEnd: "transitionend",
	works: [],
	selectedWork: null,
	siteReady: false,
	webkit: false,
	userAgent: '',
	myScroll: null,
	scrollAmount: 30,
	os: '',
	a: '555'
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



var Main = (function() {
	
	
	function init(obj) {
		
	
	}

	
	
	return {
		init : init
	};
	
}());
