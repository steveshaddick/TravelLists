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
	var errorCallback = null;

	function init(_token) {
		token = _token;
	}

	function call(action, data, onSuccess, onError) {

		if (isWaiting) return;

		if (typeof data === "undefined") {
			data = { token: token };
		} else {
			data.token = token;
		}

		callback = (typeof onSuccess === "undefined") ? null : onSuccess;
		errorCallback = (typeof onError === "undefined") ? null : onError;

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

		if (data && data.success) {
			if (callback) {
				callback(data);
				callback = null;
				errorCallback = null;
			}
		} else {
			requestFailed();	
		}
		
	}

	function requestFailed(jqXHR, textStatus) {
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

var Modal = (function() {

	function load(file, callback) {
		$("#modal").css('display', 'block');
		$("#modalContent").load(file, {}, callback);
	}

	function close() {
		$("#modalContent").html('');
		$("#modal").css('display', 'none');
	}

	return {
		load: load,
		close : close
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
			window.location = 'http://dev.maketripnotes.com/list/' + data.tripHash;
		} else {
			
		}
		

	}

	return {
		showInfo: showInfo,
		createTrip: createTrip
	};

}());

function Location(data) {
	this.name = data.name;
	this.id = data.id;
	this.listOrder = data.listOrder;

	this.$element = null;

	this.categories = [];

	this.$element = $("#clsLocation").clone(true).attr('id', 'location_' + this.id);
	this.$element.html(this.$element.html().replace(/\$LOCATION\$/g, this.name));
	$("#locations").append(this.$element);


	var notes;
	for (var i=0, len=data.categories.length; i<len; i++) {
		this.addCategory(data.categories[i].id);
		notes = data.categories[i].notes;
		for (var ii=0, llen=notes.length; ii<llen; ii++) {
			this.addNote(notes[ii]);
		}
	}

}
Location.prototype.addCategory = function(categoryId) {
	
	var $category = $("#clsCategory").clone().attr('id', 'category_' + this.id + '_' + categoryId);
	$category.html($category.html().replace(/\$CATEGORY_NAME\$/g, 'Category ' + categoryId));

	$('.locationNotes', this.$element).append($category);

	this.categories[categoryId] = $category;

	return $category;
}
Location.prototype.addNote = function(note) {
	
	var $category = (typeof this.categories[note.categoryId] == "undefined") ? this.addCategory(note.categoryId) : this.categories[note.categoryId];

	var $note = $("#clsNote").clone().attr('id', 'note_' + note.id);
	$note.html($note.html().replace(/\$NOTE\$/g, note.note));

	$category.append($note);

}

function Category() {

}

var Trip = (function() {

	var locations = [];


	var $addNoteInput = null;
	var $hiddenNoteLink = null;

	function loadTrip() {
		Ajax.call('loadTrip', {}, 
			function(data) {

				for (var i=0,len=data.locations.length; i<len; i++) {
					addLocation(data.locations[i]);
				}
			},
			function() {
				//error
			});

		$addNoteInput = $("#addNoteInput");

	}

	function addLocation(locationData) {

		var location = new Location(locationData);
		locations.push(location);
		$('.addNoteLink', location.$element).click({location: location}, addNoteClickHandler);
	}

	function addNoteClickHandler(event) {

		var location = event.data.location;

		if ($hiddenNoteLink) {
			$hiddenNoteLink.css('display', 'inline');
			$('.submitNoteLink', $addNoteInput).unbind('click');
		}
		$hiddenNoteLink = $('.addNoteLink', location.$element).css('display', 'none');

		$('.addNote', location.$element).append($("#addNoteInput"));
		$('.submitNoteLink', $addNoteInput).click({location:location}, submitNoteClickHandler);
	}

	function submitNoteClickHandler(event) {
		
		var noteText = $('#txtNoteText').val();
		var categoryId = $('#selCategory').val();

		var location = event.data.location;

		Ajax.call('addNote', 
			{
				noteText: noteText,
				categoryId: categoryId,
				locationId: location.id
			},
			function(data) {
				
				$hiddenNoteLink.css('display', 'inline');
				$('.submitNoteLink', $addNoteInput).unbind('click');
				$("#cls").append($addNoteInput);

				data.note = noteText;
				data.categoryId = categoryId;
				location.addNote(data);
			},
			function() {
				//error
			});
	}

	return {
		loadTrip: loadTrip,
		addLocation: addLocation
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
