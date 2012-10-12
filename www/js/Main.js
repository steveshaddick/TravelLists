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
		$("#landingPage").addClass('hidden');
		$("#txtTripName").prop('disabled', true);


		$("#infoPage").removeClass('hidden');
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
		{ title: 'General', obj:null},
		{ title: 'Places to Stay', obj:null },
		{ title: 'Places to Eat', obj:null },
		{ title: 'Things to Do', obj:null }
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
		$('.location-notes', this.$element).prepend($category);
	}

	this.categories[categoryId].obj = new Category($category);

	return $category;
}
Location.prototype.addNote = function(note) {
	
	var $category = (this.categories[note.categoryId].obj === null) ? this.addCategory(note.categoryId) : this.categories[note.categoryId].obj.$element;

	var $note = $("#clsNote").clone().attr('id', 'note_' + note.id);
	

	if (note.canDelete) {
		$('.note-delete-link', $note).click({ location: this, noteId: note.id }, this.deleteNoteClickHandler);
	} else {
		$('.note-delete-link', $note).remove();
	}

	note.$element = $note;
	this.notes[note.id] = note;

	if (note.linkCheck <= (new Date().valueOf() / 1000)) {
		Main.queueLinkCheck(this, note.id, note.linkUrl);
	} 
	this.parseNote(note.id);

	$('.notesWrapper', $category).append($note);
	this.categories[note.categoryId].obj.noteAdded();
}
Location.prototype.parseNote = function(noteId, linkData) {

	var note = this.notes[noteId];

	if (typeof linkData != "undefined") {
		note.linkTitle = linkData.linkTitle;
		note.linkImage = linkData.linkImage;
		note.linkDescription = linkData.linkDescription;
	}

	var regex;
	var htmlString = note.note;

	if (note.linkUrl != '') {

		if (note.linkTitle != '') {
			
			$('.link-title', note.$element).attr('href', note.linkUrl).html(note.linkTitle);
			if (htmlString == note.linkUrl) {
				$('.note-text-wrapper', note.$element).css('display', 'none');
			} else {
				$('.note-text-wrapper', note.$element).css('display', '');
			}
			$('.note-link', note.$element).css('display', '');
			
			if (note.linkImage != '') {
				$('.link-image', note.$element).attr('src', note.linkImage).parent().attr('href', note.linkUrl);
			}

			if (note.linkDescription != '') {
				$('.link-description', note.$element).html(note.linkDescription);
			}

		} else {
			$('.note-link', note.$element).css('display', 'none');
		}

	} else {
		$('.note-link', note.$element).css('display', 'none');
	}

	regex = /(\(?\bhttps?:\/\/[-A-Za-z0-9+&@#\/%?=~_()|!:,.;]*[-A-Za-z0-9+&@#\/%=~_()|])/g;
	htmlString = htmlString.replace(regex,"<a target=\"_blank\" href=\"$1\">$1</a>").replace(/href="\(/g, 'href="').replace(/\)">/g, '">');

	$('.note-text', note.$element).html(htmlString);
	$('.note-from', note.$element).html('-' + note.from);

}
Location.prototype.deleteNoteClickHandler = function(event) {
	
	var location = event.data.location;
	var note = location.notes[event.data.noteId];
	var category = location.categories[note.categoryId].obj;
	if (!note.canDelete) return;

	Ajax.call('deleteNote', { noteId: note.id },
		function() {
			$("#note_" + note.id ).remove();
			category.total --;
			if (category.total < 1) {
				category.destroy();
				location.categories[note.categoryId].obj = null;
			}
		},
		function() {
			//error
		});
}

var Category = function($element) {
	this.$element = $element;
	this.total = 0;

	this.isOpen = true;

	$('.show-hide', this.$element).click({ category: this }, this.showHide);
}
Category.prototype.showHide = function (event) {
	var category = event.data.category;

	if (category.isOpen) {
		$('.notesWrapper', category.$element).slideUp();
		$('.notes-hidden', category.$element).show();
		category.isOpen = false;
	} else {
		$('.notesWrapper', category.$element).slideDown();
		$('.notes-hidden', category.$element).hide();
		category.isOpen = true;
	}
}
Category.prototype.noteAdded = function () {
	this.total ++;
	if (this.total > 1) {
		$('.notes-hidden', this.$element).html(this.total + ' notes hidden');
	} else {
		$('.notes-hidden', this.$element).html(this.total + ' note hidden');
	}
	if (!this.isOpen) {
		$('.notesWrapper', this.$element).slideDown();
		$('.notes-hidden', this.$element).hide();
		this.isOpen = true;
	}
}
Category.prototype.destroy = function () {
	this.$element.remove();
	this.$element = false;
	this.total = 0;
	$('.show-hide', this.$element).unbind('click');
}


var NoteEditor = (function() {

	var $noteEditor;
	var linkTimeout;
	var isInit = false;
	var isEditing = false;

	var $hiddenElement = false;
	
	var currentLocation = false;
	var currentLink = '';


	function init($element) {

		$noteEditor = $("#clsNoteEditor");
		isInit = true;
	}

	function setHandlers() {
		
		$("#txtNoteText").focus();

		$('.submit-note-link', $noteEditor).click({location: currentLocation}, submitNoteClickHandler);
		$('.cancel-note-link', $noteEditor).click(cancelNoteClickHandler);
	}

	function clearHandlers() {
		$('.submit-note-link', $noteEditor).unbind('click');
		$('.cancel-note-link', $noteEditor).unbind('click');
	}

	function submitNoteClickHandler(event) {
		var noteText = $("#txtNoteText").val();
		var categoryId = $('#selCategory').val();
		var from = $('#txtFromName').val();

		if (from == '') {
			from = 'Anonymous';
		}

		var location = event.data.currentLocation;

		//TODO form error checking, loading

		Ajax.call('addNote', 
			{
				noteText: noteText,
				from: from,
				categoryId: categoryId,
				locationId: currentLocation.id
			},
			function(data) {
				
				resetEditor();

				data.categoryId = categoryId;

				currentLocation.addNote(data);
			},
			function() {
				//error
			});
	}

	function cancelNoteClickHandler(event) {
		resetEditor();
	}

	function resetEditor() {
		if (!isEditing) return;

		$hiddenElement.css('display', '');
		$hiddenElement = false;

		$("#txtNoteText").val('');
		$('#selCategory').val('0');

		clearHandlers();
		$("#cls").append($noteEditor);
	}

	function newNote($element, location) {
		if (!isInit) init();

		if ($hiddenElement !== false) {
			$hiddenElement.css('display', '');
			clearHandlers();
		}
		$hiddenElement = $(':first-child', $element).css('display', 'none');

		currentLocation = location;

		$element.append($noteEditor);
		setHandlers(currentLocation);

		isEditing = true;
	}

	return {
		newNote: newNote
	}

}());

var Trip = (function() {

	var map;
	var locations = [];
	var locationCount = 0;
	var bounds;

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

		bounds = new google.maps.LatLngBounds();

		var mapOptions = {
          center: new google.maps.LatLng(obj.lat, obj.lng),
          zoom: 4,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          disableDefaultUI : true,
          disableDoubleClickZoom: true,
          scrollwheel: false

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

		$('.add-note-link', location.$element).click({location: location}, addNoteClickHandler);
	}

	function addNoteClickHandler(event) {

		var location = event.data.location;

		NoteEditor.newNote($(this).parent(), location);

	}

	function submitNoteClickHandler(event) {
		
		
	}

	function deleteLocation(locationId) {
		//TODO delete listeners?
		$("#location_" + locationId).remove();
		if (locations[locationId].marker) {
			locations[locationId].marker.setMap(null);
		}
		locations.splice(locationId, 1);
		locationCount --;

		if (locationCount > 1) {
			bounds = new google.maps.LatLngBounds();
			for (var id in locations) {
				if (locations[id].marker) {
					bounds.extend(locations[id].marker.getPosition());
					map.fitBounds(bounds);
				}
			}
		}
	}

	return {
		loadTrip: loadTrip,
		addLocation: addLocation,
		deleteLocation: deleteLocation
	}
}());


var Main = (function() {

	
	var linkQueue = [];
	
	function init(obj) {
		
		Ajax.init(obj.a);
		$("body select").msDropDown();


	}

	function loadBlock() {
		$("#loadBlocker").css('display', 'block');
	}
	function loadRelease() {
		$("#loadBlocker").css('display', 'none');
	}

	function queueLinkCheck(location, noteId, url) {

		if (url =='') return;

		linkQueue.push({location: location, noteId:noteId, url: url});

		processLinkQueue();
	}

	function processLinkQueue() {
		if (linkQueue.length == 0) return;

		var linkCheck = linkQueue[0];

		Ajax.call('checkLink', 
			{
				noteId: linkCheck.noteId,
				url: linkCheck.url
			},
			function(linkData) {
				linkCheck.location.parseNote(linkCheck.noteId, linkData);
				processLinkQueue();
			},
			function() {
				processLinkQueue();
			},
			true);

		linkQueue.shift();
	}
	
	return {
		init : init,
		loadBlock: loadBlock,
		loadRelease: loadRelease,
		queueLinkCheck: queueLinkCheck
	};
	
}());
