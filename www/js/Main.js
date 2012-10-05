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
	this.lat = data.lat;
	this.lng = data.lng;

	this.$element = null;

	this.categories = [
		{ title: '', $element:false, total:0},
		{ title: 'Places to eat', $element:false, total:0 },
		{ title: 'Places to whatever', $element:false, total:0 },
		{ title: 'Whatevers to whatever', $element:false, total:0 }
		];

	this.notes = [];

	this.$element = $("#clsLocation").clone(true).attr('id', 'location_' + this.id);
	this.$element.html(this.$element.html().replace(/\$LOCATION\$/g, this.name).replace(/\$LOCATION_ID\$/g, this.id));
	$("#locations").append(this.$element);


	var notes;
	for (var i=0, len=data.notes.length; i<len; i++) {
		this.addNote(data.notes[i]);
	}

}
Location.prototype.addCategory = function(categoryId) {
	
	var $category = $("#clsCategory").clone().attr('id', 'category_' + this.id + '_' + categoryId);
	$category.html($category.html().replace(/\$CATEGORY_NAME\$/g, this.categories[categoryId].title));

	var $before = false;
	var beforeId = 0;
	var $check;
	while (beforeId < categoryId) {
		$check = $('#category_' + this.id + '_' + beforeId, this.$element);
		if ($check.length > 0) {
			$before = $check;
		}
		beforeId ++;
	}

	if ($before) {
		$before.after($category);
	} else {
		$('.locationNotes', this.$element).prepend($category);
	}

	this.categories[categoryId].$element = $category;

	return $category;
}
Location.prototype.addNote = function(note) {
	
	var $category = (this.categories[note.categoryId].$element === false) ? this.addCategory(note.categoryId) : this.categories[note.categoryId].$element;

	var $note = $("#clsNote").clone().attr('id', 'note_' + note.id);
	$note.html($note.html().replace(/\$NOTE\$/g, note.note));

	if (note.canDelete) {
		$('.deleteNoteLink', $note).click({ location: this, noteId: note.id }, this.deleteNoteClickHandler);
	} else {
		$('.deleteNoteLink', $note).remove();
	}
	this.categories[note.categoryId].total ++;

	this.notes[note.id] = note;

	$category.append($note);

}
Location.prototype.deleteNoteClickHandler = function(event) {
	
	var location = event.data.location;
	var note = location.notes[event.data.noteId];
	var category = location.categories[note.categoryId];
	if (!note.canDelete) return;

	Ajax.call('deleteNote', { noteId: note.id },
		function() {
			$("#note_" + note.id ).remove();
			category.total --;
			if (category.total < 1) {
				category.$element.remove();
				category.$element = false;
				category.total = 0;
			}
		},
		function() {
			//error
		});
}

var Trip = (function() {

	var map;
	var locations = [];
	var locationCount = 0;
	var bounds = new google.maps.LatLngBounds();

	var $addNoteInput = null;
	var $hiddenNoteLink = null;

	function loadTrip(obj) {
		Ajax.call('loadTrip', {}, 
			function(data) {

				for (var i=0,len=data.locations.length; i<len; i++) {
					if (i < len-1) {
						addLocation(data.locations[i], true);
					} else {
						addLocation(data.locations[i]);
					}
				}
			},
			function() {
				//error
			});

		$addNoteInput = $("#addNoteInput");

		var mapOptions = {
          center: new google.maps.LatLng(obj.lat, obj.lng),
          zoom: 4,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        map = new google.maps.Map(document.getElementById("map"), mapOptions);

	}

	function addLocation(locationData, loopOverride) {

		var location = new Location(locationData);
		var marker = null;
		if ((location.lat != 0) && (location.lng != 0)) {
			var markerOptions = {
				animation: google.maps.Animation.DROP,
				position: new google.maps.LatLng(location.lat, location.lng),
				title: location.name
			}
			marker = new google.maps.Marker(markerOptions);
			marker.setMap(map);

			bounds.extend(markerOptions.position);
		}

		locations[location.id] = {
			location: location,
			marker: marker
		};
		locationCount ++;

		if (typeof loopOverride == "undefined") {
			if (locationCount > 1) {
				map.fitBounds(bounds);
			} else {
				map.setCenter(markerOptions.position);
			}
		}

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

	function deleteLocation(locationId) {
		//TODO delete listeners?
		$("#location_" + locationId).remove();
		if (locations[locationId].marker) {
			locations[locationId].marker.setMap(null);
		}
		locations.splice(locationId, 1);
		locationCount --;
	}

	return {
		loadTrip: loadTrip,
		addLocation: addLocation,
		deleteLocation: deleteLocation
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
