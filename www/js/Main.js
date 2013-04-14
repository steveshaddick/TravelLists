if (typeof console == "undefined") {
	console = {
		log: function() {}
	};
}

var GLOBAL = {
	isAdmin: false,
	polltime: 15000,
	lastLocation: 0,
	lastNote: 0,
	lastNotice: 0,
	activeNoteLocation: null,
	noteCookie: false
};

var TransitionController = (function() {

	var prefix = '';
	
	function transitionEnd($obj, callback) {
		if (typeof callback == "undefined") {
			return;
		}
		if (prefix === '') {
			if ($.browser.webkit) {
			    prefix = "webkitTransitionEnd";
			} else if ($.browser.msie) {
			    prefix = "msTransitionEnd";  
			} else if ($.browser.mozilla) {
			    prefix = "transitionend";
			} else if ($.browser.opera) {
			   prefix = "oTransitionEnd";
			}  else {
				prefix = 'none';
			}
		}

		if ((Modernizr.csstransitions) && (prefix !== 'none')){
			
			$obj.unbind(prefix);
			
			$obj.bind(prefix, function() {
				$obj.unbind(prefix);
				callback($obj);
			});
		} else {
			callback($obj);
		}
	}
	
	return {
		transitionEnd: transitionEnd
	};
	
}());

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

	var loadCallback;
	var contentClass;
	var isModal = false;

	function load(file, callback, style) {
		loadCallback = callback;
		isModal = true;
		contentClass = style;

		$("#modal").css('display', 'block');
		$("#modalContent").load(file, {}, onLoad);
	}

	function close() {
		
		if (typeof contentClass != "undefined") {
			$("#modalContent").removeClass(contentClass);
		}

		isModal = false;
		contentClass = false;

		$("#modalContent").html('');
		$("#modal").css('display', 'none');

		$(document).unbind('keydown', keyDownHandler);
		$("#modalUnder").unbind('click', clickHandler);

	}

	function onLoad() {
		if (!isModal) return;

		if (typeof contentClass != "undefined") {
			$("#modalContent").addClass(contentClass);
		}

		if (typeof loadCallback != "undefined") {
			loadCallback();
			loadCallback = false;
		}

		$(document).keydown(keyDownHandler);
		$("#modalUnder").click(clickHandler);
	}

	function keyDownHandler(e) {
		switch (e.which) {
			case 27:
				close();
				break;
		}
	}

	function clickHandler() {
		close();
		return false;
	}

	return {
		load: load,
		close : close
	}

}());


function Location(data, isLast) {
	this.name = data.name;
	this.id = data.id;
	this.listOrder = data.listOrder;
	this.lat = data.lat;
	this.lng = data.lng;
	this.isOpen = true;
	this.totalNotes = 0;

	this.text = [];
	this.text['suggestCTA'] = '';
	this.text['noteTextPlaceholder'] = '';

	this.$element = null;
	this.$notesElement = null;
	this.$showHideButton = null;
	this.$noteText = null;

	this.notes = [];

	var isLast = (typeof isLast === "undefined") ? false : isLast;

	this.$element = $("#clsLocation").clone(true).attr('id', 'location_' + this.id);
	this.$element.html(this.$element.html().replace(/\$LOCATION\$/g, this.name).replace(/\$LOCATION_ID\$/g, this.id));
	this.$element.attr('data-order', this.listOrder);

	this.$noteText = $(".txtNoteText", this.$element);
	this.text['suggestCTA'] = $(".note-text-label", this.$element).html();

	var rnd = Math.floor(Math.random() * 10);
	this.text['noteTextPlaceholder'] = "ex. You've got to try the skybar!";
	switch (rnd) {
		
		case 0:
			this.text['noteTextPlaceholder'] = "ex. There's a great hostel called Best Hostel Ever.";
			break;

		case 1:
			this.text['noteTextPlaceholder'] = "ex. Go to Mindy's and order the soup.";
			break;	

		case 2:
			this.text['noteTextPlaceholder'] = "ex. Contemporary art gallery. Don't miss it.";
			break;
	}
	this.$noteText.attr('placeholder', this.text['noteTextPlaceholder']).focus({ location: this }, this.noteTextFocus);


	this.$showHideButton = $('.show-hide-link', this.$element);
	this.$showHideButton.click({ location: this }, this.showHide);

	var locations = $("#locations > .location");
	if ((locations.length === 0) || (isLast)){
		$("#locations").append(this.$element);
	} else {
		
		var me = this;
		var isAdded = false;
		locations.each(function() {
			if (!isAdded) {
				if ($(this).attr('data-order') > me.listOrder) {
					$(this).before(me.$element);
					isAdded = true;
				}
			}
		});
		if (!isAdded) {
			$("#locations").append(this.$element);
		}
	}

	this.$notesElement = $('.notes-wrapper', this.$element);

	var notes;
	for (var i=0, len=data.notes.length; i<len; i++) {
		this.addNote(data.notes[i]);
	}

}
Location.prototype.destroy = function() {

};

Location.prototype.addNote = function(note, animate) {
	
	var $note = $("#clsNote").clone().attr('id', 'note_' + note.id);

	animate = (typeof animate == "undefined") ? false : animate;
	
	if (note.canDelete){
		$('.note-delete a', $note).removeClass('edit-mode').click({ location: this, noteId: note.id }, this.deleteNoteClickHandler);
	}

	note.$element = $note;
	this.notes[note.id] = note;

	if (note.linkCheck <= (new Date().valueOf() / 1000)) {
		Main.queueLinkCheck(this, note.id, note.linkUrl);
	} 
	this.parseNote(note.id);

	this.$notesElement.append($note);

	if ((this.isOpen) && (animate)) {
		$note.hide().show('slow');
	}

	this.$showHideButton.removeClass('hidden');

	this.totalNotes ++;
	if (this.totalNotes > 1) {
		$('.notes-hidden', this.$element).html(this.totalNotes + ' notes hidden');
	} else {
		$('.notes-hidden', this.$element).html(this.totalNotes + ' note hidden');
	}
	
	if (note.id > GLOBAL.lastNote) {
		GLOBAL.lastNote = note.id;
	}
};
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

		if ((note.linkImage != '') || (note.linkDescription != '') ){
			
			$('.link-title', note.$element).attr('href', note.linkUrl).html(note.linkTitle);
			if (htmlString == note.linkUrl) {
				$('.note-text', note.$element).css('display', 'none');
			} else {
				$('.note-text', note.$element).css('display', '');
			}
			$('.note-link', note.$element).css('display', '');
			
			if (note.linkImage != '') {
				$('.link-image', note.$element).attr('src', note.linkImage).parent().attr('href', note.linkUrl);
			} else {
				$('.link-image', note.$element).addClass('hidden');
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

	switch (note.categoryId) {
		case '1':
		 	$('.note-category', note.$element).addClass('stay');
			break;
		case '2':
		 	$('.note-category', note.$element).addClass('food');
			break;
		case '3':
		 	$('.note-category', note.$element).addClass('poi');
			break;
	}

	if (note.fromName == '') {
		note.fromName = 'Anonymous';
	}
	$('.note-text', note.$element).html(htmlString);
	$('.note-from', note.$element).html('-' + note.fromName);

};
Location.prototype.deleteNoteClickHandler = function(event) {
	
	var location = event.data.location;
	var note = location.notes[event.data.noteId];

	if ((typeof note == "undefined") || (!note.canDelete)) return;

	Ajax.call('deleteNote', 
		{ 
			noteId: note.id,
			noteCookie: GLOBAL.noteCookie

		},
		function() {
			$("#note_" + note.id ).remove();
			delete location.notes[note.id];
			
			location.totalNotes --;
			if ((location.totalNotes > 1) || (location.totalNotes == 0)) {
				$('.notes-hidden', location.$element).html(location.totalNotes + ' notes hidden');
			} else {
				$('.notes-hidden', location.$element).html(location.totalNotes + ' note hidden');
			}
			
		},
		function() {
			//error
		});

	return false;
};
Location.prototype.showHide = function(event) {
	var location = event.data.location;

	if (location.isOpen) {
		$('.notes-wrapper', location.$element).slideUp();
		$('.notes-hidden', location.$element).show();
		location.isOpen = false;
		location.$showHideButton.html('+').attr('title', 'Expand');
	} else {
		$('.notes-wrapper', location.$element).slideDown();
		$('.notes-hidden', location.$element).hide();
		location.isOpen = true;
		location.$showHideButton.html('&#150;').attr('title', 'Collapse');
	}

	return false;
}
Location.prototype.noteTextFocus = function(event) {
	var location = event.data.location;
	if (GLOBAL.activeNoteLocation) {
		GLOBAL.activeNoteLocation.cancelNote();
	}
	location.editNote();
	
}
Location.prototype.noteTextBlur = function(event) {

	var location = event.data.location;

	if ($.trim(location.$noteText.val()) == '') {
		location.cancelNote();
		return;
	}

	
}
Location.prototype.editNote = function() {
	
	var me = this;
	GLOBAL.activeNoteLocation = this;

	this.$noteText.blur({ location: this }, this.noteTextBlur);

	$('.note-text-label', this.$element).addClass('hidden');
	this.$noteText.attr('placeholder', '').addClass('editing');
	this.$noteText.keyup(
		function(e) {
			if (e.which == 27) {
				me.cancelNote();
				return;
			}
			if (e.which == 13) {
				if ($("#txtFromName").val() == '') {
					$("#txtFromName").focus();
				} else {
					me.submitNote();
				}
			}
		}
	);

	$('.category-wrapper', this.$element).append($('#clsCategorySelector'));
	$('.note-editor-bottom', this.$element).append($('#clsNoteFrom')).append($('#clsSubmitNote')); 

	$("#txtFromName").keyup(
		function(e) {
			if (e.which == 27) {
				me.cancelNote();
				return;
			}
			if (e.which == 13) {
				me.submitNote();
			}
		}
	);

	$("#submitNoteButton").click(function() { me.submitNote(); return false;});
	$("#cancelNoteButton").click(function() { me.cancelNote(); return false;});

}
Location.prototype.cancelNote = function() {
	GLOBAL.activeNoteLocation = null;

	$('.note-text-label', this.$element).removeClass('hidden');
	this.$noteText.attr('placeholder', this.text['noteTextPlaceholder']).removeClass('editing');
	this.$noteText.unbind('keyup').unbind('blur');
	this.$noteText.val('').blur();

	$('#cls').append($('#clsCategorySelector')).append($('#clsNoteFrom')).append($('#clsSubmitNote')); 

}
Location.prototype.submitNote = function() {
	var noteText = $.trim(this.$noteText.val());
	var categoryId = $('#selCategory').val();
	var fromName = $.trim($('#txtFromName').val());

	if (noteText == '') {
		this.cancelNote();
		return;
	}

	if (fromName == '') {
		fromName = 'Anonymous';
	}

	$.cookie('from', fromName, { expires: 365, path: '/' });
	if (!GLOBAL.noteCookie) {
		GLOBAL.noteCookie = "";
		var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

		for( var i=0; i < 10; i++ )
			GLOBAL.noteCookie += possible.charAt(Math.floor(Math.random() * possible.length));
		GLOBAL.noteCookie += new Date().valueOf();
	}

	//TODO form error checking, loading
	
	$(".blocker", this.$element).removeClass('hidden');

	var me = this;
	Ajax.call('addNote', 
		{
			noteText: noteText,
			fromName: fromName,
			categoryId: categoryId,
			locationId: this.id,
			noteCookie: GLOBAL.noteCookie
		},
		function(data) {
			
			me.cancelNote();
			$(".blocker", this.$element).addClass('hidden');
			data.categoryId = categoryId;
			me.addNote(data);
		},
		function() {
			//error
			me.cancelNote();
			$(".blocker", this.$element).addClass('hidden');
		});

}

var NoteEditor = (function() {

	var $noteEditor;
	var $txtNoteText;
	var $txtNameText;
	var linkTimeout;
	var isInit = false;
	var isEditing = false;
	var noteCookie = false;

	var $hiddenElement = false;
	
	var currentLocation = false;
	var currentLink = '';
	
	var labelIndex = -1;
	var labels = [
		'Suggest somewhere to eat, stay or do.',
		'Press <strong>enter</strong> to add.'
	];


	function init($element) {

		$noteEditor = $("#clsNoteEditor");
		
		labelIndex = 0;
		$('.note-text-label', $noteEditor).html(labels[labelIndex]);

		if ($.cookie('from')) {
			$("#txtFromName").val($.cookie('from'));
		}
		isInit = true;

	}

	function setHandlers() {
		$txtNoteText = $("#txtNoteText");
		$txtNameText = $("#txtFromName");
		$txtNoteText.prop('disabled', false).keyup(noteKeyUpHandler).focus();

		$('.submit-note-link', $noteEditor).click({location: currentLocation}, submitNoteClickHandler);
		$('.cancel-note-link', $noteEditor).click(cancelNoteClickHandler);
	}

	function clearHandlers() {
		$txtNoteText.prop('disabled', true).unbind('keyup');
		$txtNameText.prop('disabled', true).unbind('keyup');
		$('.submit-note-link', $noteEditor).unbind('click');
		$('.cancel-note-link', $noteEditor).unbind('click');
		$txtNameText = $txtNoteText = null;
	}

	function noteKeyUpHandler(e) {
		if (e.which == 27) {
			cancelNoteClickHandler();
			return;
		}
		if ($.trim($txtNoteText) != '') {
			if (labelIndex !== 1) {
				labelIndex = 1;
				$('.note-text-label', $noteEditor).html(labels[labelIndex]);
			}
			if (e.which == 13) {
				showBottom();
			}
		} else {
			if (labelIndex !== 0) {
				labelIndex = 0;
				$('.note-text-label', $noteEditor).html(labels[labelIndex]);
			}
		}
	}

	function nameKeyUpHandler(e) {
		switch (e.which) {
			case 13:
				submitNoteClickHandler();
				break;
			case 27:
				cancelNoteClickHandler();
				break;
		}
	}

	function showBottom() {

		$txtNoteText.prop('disabled', true).unbind('keyup');
		$('.note-editor-bottom', $noteEditor).removeClass('hidden');

		$('.note-text', $noteEditor).html($.trim($txtNoteText.val()));
		$('.note-text-wrapper', $noteEditor).addClass('hidden');
		$('.note-editor-bottom', $noteEditor).removeClass('hidden');
		$txtNameText.prop('disabled', false).keyup(nameKeyUpHandler).focus();
	}

	function submitNoteClickHandler(event) {
		
		/*var noteText = $.trim($("#txtNoteText").val());
		var categoryId = $('#selCategory').val();
		var fromName = $.trim($('#txtFromName').val());

		if (fromName == '') {
			fromName = 'Anonymous';
		}

		var location = event.data.currentLocation;

		$.cookie('from', fromName, { expires: 365, path: '/' });
		if (!noteCookie) {
			noteCookie = "";
			var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

			for( var i=0; i < 10; i++ )
				noteCookie += possible.charAt(Math.floor(Math.random() * possible.length));
			noteCookie += new Date().valueOf();
			$.cookie('noteCookie', noteCookie);
		}

		//TODO form error checking, loading
		
		$("#noteEditorBlocker").removeClass('hidden');

		Ajax.call('addNote', 
			{
				noteText: noteText,
				fromName: fromName,
				categoryId: categoryId,
				locationId: currentLocation.id,
				noteCookie: noteCookie
			},
			function(data) {

				resetEditor();
				data.categoryId = categoryId;
				currentLocation.addNote(data);
			},
			function() {
				//error
			});

		return false;*/
	}

	function cancelNoteClickHandler(event) {
		resetEditor();
		return false;
	}

	function resetEditor() {
		if (!isEditing) return;

		$hiddenElement.css('display', '');
		$hiddenElement = false;

		$("#txtNoteText").val('');
		$('#selCategory').val('1');

		labelIndex = 0;
		$('.note-text-label', $noteEditor).html(labels[labelIndex]);

		$("#noteEditorBlocker").addClass('hidden');
		$('.note-editor-bottom', $noteEditor).addClass('hidden');

		$('.note-text-wrapper', $noteEditor).removeClass('hidden');

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

	var tripName = '';
	var tripAuthor = '';
	var email = '';

	var isEditMode = false;

	var $hiddenNoteLink = null;

	function loadTrip(obj) {

		$("body select").msDropDown();

		Ajax.call('loadTrip', {}, 
			function(data) {

				for (var i=0,len=data.locations.length; i<len; i++) {
					if (i < len-1) {
						addLocation(data.locations[i], true);
					} else {
						addLocation(data.locations[i]);
					}
				}

				tripName = data.tripName;
				tripAuthor = data.tripAuthor;
				email = data.email;

				$("#editTripButton").click(checkAdmin);

				if (GLOBAL.isAdmin) {
					ListAdmin.init(data.notices);
				}

				Main.poll();
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

        if ($.cookie('from')) {
			$("#txtFromName").val($.cookie('from'));
		}

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
			google.maps.event.addListener(marker, 'click', function() {
				var scrollTo = location.$element.offset().top;
				$('html, body').animate({scrollTop: scrollTo}, 500);
			});
			marker.setMap(map);

			bounds.extend(markerOptions.position);
		}

		locations[location.id] = {
			location: location,
			marker: marker
		};
		locationCount ++;

		if (locationData.id > GLOBAL.lastLocation) {
			GLOBAL.lastLocation = locationData.id;
		}

		if (typeof loopOverride == "undefined") {
			if (locationCount > 1) {
				map.fitBounds(bounds);
			} else {
				map.setCenter(markerOptions.position);
			}
		}

		//$('.add-note-link', location.$element).click({location: location}, addNoteClickHandler);
	}

	function addNote(note, animate) {
		if (typeof locations[note.locationId] !== "undefined") {
			locations[note.locationId].location.addNote(note, animate);
		}
	}

	/*function addNoteClickHandler(event) {

		var location = event.data.location;

		//NoteEditor.newNote($(this).parent(), location);

	}*/

	/*function submitNoteClickHandler(event) {
		
		
	}*/

	function deleteLocation(locationId) {
		//TODO delete listeners?
		$("#location_" + locationId).remove();
		if (locations[locationId].marker) {
			locations[locationId].marker.setMap(null);
			//google.maps.event.removeEventListener(locations[locationId].marker, 'click');
		}

		locations[locationId].location.destroy();
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

	function reorderLocation(locationId, isUp) {

		var $currentLocation = $("#location_" + locationId);
		var currentOrder = parseInt($currentLocation.attr("data-order"));
		var newOrder = (isUp) ? currentOrder - 1 : currentOrder + 1;

		if (newOrder < 1) return;
		if (newOrder > locationCount) return;

		var $swapLocation = $(".location").filter(function() { return $.attr(this, "data-order") == newOrder; });

		Ajax.call('reorderLocation', 
			{
				currentLocation: locationId,
				swapLocation: $swapLocation.attr('id').replace("location_", ""),
				newOrder: newOrder,
				swapOrder: currentOrder
			}, 
			function(data) {
				$swapLocation.attr("data-order", currentOrder);
				$currentLocation.attr("data-order", newOrder);

				if (isUp) {
					$swapLocation.before($currentLocation);
				} else {
					$swapLocation.after($currentLocation);
				}
			},
			function() {
				//error
			});
	}

	function markerClickHandler(event) {
		console.log(event);
	}

	function getTripInfo() {
		return {
			tripName: tripName,
			tripAuthor: tripAuthor
		};
	}

	function checkAdmin() {

		EditModeModal.open();
		return false;
	}

	return {
		loadTrip: loadTrip,
		addLocation: addLocation,
		addNote: addNote,
		deleteLocation: deleteLocation,
		reorderLocation: reorderLocation,
		getTripInfo: getTripInfo
	}
}());

var EditModeModal = (function() {

	var $txtEmail;
	var $submit;
	var isSending = false;

	function open() {
		Modal.load('/views/modal/enterEmail.html',
			init,
			'email-modal'
			);
	}

	function validateEmail(email) { 
    	var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    	return re.test(email);
	} 

	function txtChange(e) {
		var txtValid = true;
		if ($.trim($txtEmail.val()) == '') {
			txtValid = false;
		}
		if ($txtEmail.hasClass('error')) {
			$txtEmail.removeClass('error');
			$("#errorReturn").addClass('hidden');
		}

		if (txtValid) {
			$submit.removeClass('hidden');
		} else {
			$submit.addClass('hidden');
		}
	}

	function init() {

		$submit = $("#emailAdmin");
		$txtEmail = $("#txtEmail");
		isSending = false;

		$txtEmail.keyup(txtChange).focus();
		$submit.click(sendEmail);
		$("#isRemember").click(isRememberCookieClick);
		$(document).keyup(keyUpHandler);
		$("#oopsLink").click(close);

		if ($.cookie('email')) {
			$("#isRemember").prop('checked', true);
			$txtEmail.val($.cookie('email'));
		} else {
			$submit.focus();
		}

		txtChange();

	}

	function sendEmail() {
		
		if (isSending) return;

		var email = $txtEmail.val();

		if (!validateEmail(email)) {
			$txtEmail.addClass('error');
			return;
		}
		isSending = true;

		if ($("#isRemember").is(':checked')) {
			$.cookie('email', email, { expires: 365, path: '/' });
		}
		Ajax.call('checkEditMode',
			{
				email: email
			},
			function() {
				EditMode.init();
				close();
			},
			function() {
				$txtEmail.addClass('error');
				$("#errorReturn").removeClass('hidden');
				isSending = false;

			});

		return false;
	}

	function isRememberCookieClick() {
		if (!$("#isRemember").is(':checked')) {
			$.removeCookie('email', { path: '/' });
		}
	}

	function keyUpHandler(e) {
		switch (e.which) {
			case 13:
				sendEmail();
				break;
		}
	}

	function close() {

		$txtEmail.unbind('keyup',txtChange);
		$submit.unbind('click',sendEmail);
		$("#isRemember").unbind('click',isRememberCookieClick);
		$(document).unbind('keyup',keyUpHandler);

		$submit = null;
		$txtEmail = null;
		isSending = false;

		Modal.close();
	}

	return {
		open: open,
		close: close
	}
}());

var EditMode = (function() {

	var autocomplete = null;
	var editTitle;
	var editSubtitle;

	function init() {
		$(".edit-mode").removeClass('edit-off');
		if (GLOBAL.activeNoteLocation) {
			GLOBAL.activeNoteLocation.cancelNote();
		}
		$(".add-note").addClass('hidden');
		$("header").addClass('edit-on');
		$("#map").addClass('edit-on');

		$("#addLocationButton").click(addLocation);
		$(document).on('click', '.delete-location-button', deleteLocation).on('click', '.location-up', reorderLocation).on('click', '.location-down', reorderLocation);
		$("#editDoneButton").click(dinit);

		editTitle = new EditText($("#tripTitle"), function() { save({tripTitle:$("#tripTitle").html() }); });
		editSubtitle = new EditText($("#tripSubtitle"), function() { save({tripSubtitle:$("#tripSubtitle").html() }); });

		$("#editBar").slideDown();
	}

	function dinit() {
		Ajax.call('closeEditMode');

		$(".edit-mode").addClass('edit-off');
		$(".add-note").removeClass('hidden');
		$("header").removeClass('edit-on');
		$("#map").removeClass('edit-on');

		$("#addLocationButton").unbind('click');
		$(document).unbind('click');
		$("#editDoneButton").unbind('click');

		editTitle.destroy();
		editSubtitle.destroy();

		$("#editBar").slideUp();

		return false;
	}

	function addLocation() {
		$('html, body').scrollTop(0);
		Modal.load('/views/modal/addLocation.html', function() {
			var options = {
			  types: ['(regions)']
			};

			autocomplete = new google.maps.places.Autocomplete(document.getElementById('txtLocation'), options);

			$('.submitLocationLink').click(submitLocation);
		});

		return false;
	}

	function submitLocation() {
		var location = $('#txtLocation').val();
		$('#txtLocation').prop('disabled', true);

		Ajax.call('addLocation', {location: location}, 
			function(data) {
				autocomplete = null;
				$('.submitLocationLink').unbind('click');
				Modal.close();
				Trip.addLocation(data);
			},
			function() {
				$('#txtLocation').val('');
				$('#txtLocation').prop('disabled', false);
			});
	}

	function deleteLocation(event) {
		var locationId = $(this).attr('data-id');

		Ajax.call('deleteLocation', {locationId: locationId}, 
			function(data) {
				Trip.deleteLocation(locationId);
			},
			function() {
				//error
			});

		return false;
	}

	function reorderLocation(event) {
		var locationId = $(this).attr('data-id');

		Trip.reorderLocation(locationId, $(event.target).hasClass('location-up') ? true : false);

		return false;
	}

	function save(data) {

		Ajax.call('saveTrip', data);

	}

	return {
		init: init,
		dinit: dinit
	}

}());

var EditText = function($element, saveCallback) {

	this.$element = $element;
	this.saveCallback = saveCallback;

	this.$divWrapper = $('<div><input type="text" disabled="disabled" class="editTextInput" /></div>');
	this.$divWrapper.attr('class', this.$element.attr('class'));

	this.$input = $('.editTextInput', this.$divWrapper).css('display', 'none');

	this.$element.after(this.$divWrapper);
	this.$divWrapper.append(this.$element);
	this.$input.val(this.$element.html());

	this.$divWrapper.click({editText: this}, this.onClickHandler);
}

EditText.prototype.onClickHandler = function(event) {

	var editText = event.data.editText;

	editText.$input.css('display', '').prop('disabled', false).attr('class', 'editTextInput ' + editText.$element.attr('class'));
	editText.$element.css('display', 'none');

	editText.$divWrapper.unbind('click');

	editText.$input.select().blur({editText: editText}, editText.finishText).keypress({editText: editText}, editText.onKeypress);

}

EditText.prototype.onKeypress = function(event) {
	var code = (event.keyCode ? event.keyCode : event.which);
	var editText = event.data.editText;

	switch (code) {
		//enter
		case 13:
			editText.finishText(event);
			break;

		//escape
		case 27:
			editText.$input.val(editText.$element.html());
			event.data.noSave = true;
			editText.finishText(event);
			break;

	}
}

EditText.prototype.finishText = function(event) {

	var editText = event.data.editText;
	editText.$input.prop('disabled', true).unbind('blur').unbind('keypress').css('display', 'none');

	editText.$element.css('display', '').html(editText.$input.val());

	editText.$divWrapper.click({editText: editText}, editText.onClickHandler);

	if (typeof event.data.noSave == "undefined") {
		editText.saveCallback();
	}
}

EditText.prototype.destroy = function() {
	this.$element = null;
	this.saveCallback = null;

	this.$divWrapper.unbind('click');
	this.$divWrapper = null;
	this.$input = null;
}

var ListAdmin = (function() {

	

	function init(data) {
		
		var notices = data.notices;

		$('.add-location-link').click(addLocation);
		

		$(".settings-button").click(Settings.toggleSettings);


		setTimeout(function() {
			if (typeof notices !== "undefined") {
				for (var i=0,len=notices.length; i<len; i++) {
					if (i < len-1) {
						Notice.addNotice(notices[i], true);
					} else {
						Notice.addNotice(notices[i]);
					}
				}
			}
		}, 1000);
		

	}

	

	

	

	/*function sortNotes(event, ui) {
		var $parent = ui.item.parent();

		var notes = [];
		$('li', $parent).each(function(index) {
			notes.push($(this).attr('id').replace('note_', ''));
		});

		save({
			noteOrder: {	
				category: $parent.parent().attr('id').replace('category_', ''),
				notes: notes
			}
		});
	}*/

	return {
		init: init/*,
		save: save,
		sortNotes: sortNotes*/
	}

}());





var Notice = (function() {

	var notices = [];

	var $notice = null;
	var $container = null;

	var offset = 0;
	var $doc = null;
	var wait = false;

	function addNotice(notice, skip) {

		skip = (typeof skip === "undefined") ? false : skip;

		notices.unshift(notice);
		if (notice._id > GLOBAL.lastNotice) {
			GLOBAL.lastNotice = notice._id;
		}
		if (!skip) {
			showNotice();
		}

	}

	function showNotice() {
		
		
		if (!$notice) {
			$container = $("#noticeContainer");
			$container.css('display', 'block');
			$notice = $(".notice", $container);
			
			offset = $container.offset().top;
			$doc = $(document);
			$(window).scroll(checkScroll);
		}
		
		checkScroll();
		$notice.removeClass('down').addClass('up');

		$('.notice-text', $notice).html(notices[0].notice);
		$('.delete-link', $notice).unbind('click');

		setTimeout(function() {
			
			$notice.removeClass('up');
			TransitionController.transitionEnd($notice, function() {
				$('.delete-link', $notice).bind('click', removeNoticeClick);
			});

		}, 1);
	}

	function removeNoticeClick(event) {
		
		$('.delete-link', $notice).unbind('click');
		$notice.removeClass('up').addClass('down');
		TransitionController.transitionEnd($notice, function() {
			removeNotice();
		});
		
		Ajax.call('deleteNotice', {noticeId: notices[0]._id}, 
			null,
			null,
			true
		);
	}

	function checkScroll() {

		if (wait) {
			return;
		}

		if($doc.scrollTop() >= offset){
			$container.addClass('fixed');
		} else {
			$container.removeClass('fixed');
		}
		wait = true;
		setTimeout(function(){ wait = false; }, 50);
	}

	function removeNotice() {
		
		notices.shift();
		if ( notices.length > 0) {
			showNotice();
		} else {
			$container.css('display', 'none');
			$notice = null;
			$container = null;
			$(window).unbind('scroll', checkScroll);

		}
	}

	return {
		addNotice: addNotice
	}

}());

var Settings = (function() {

	var isInit = false;
	var isOpen = false;


	function open() {
		$("txtTripName").val()

	}

	function toggleSettings() {
		if (isOpen) {
			open();
		} else {
			close();
		}
	}

	return {
		toggleSettings: toggleSettings
	};
}());




var Main = (function() {

	
	var linkQueue = [];
	
	function init(obj) {
		
		Ajax.init(obj.a);
		GLOBAL.isAdmin = obj.isAdmin;
		GLOBAL.noteCookie = obj.noteCookie;

		$("#shareTripButton").click(openShareModal);
		
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

	function poll() {
		
		setTimeout(sendPoll, GLOBAL.polltime);
	}

	function sendPoll() {
		Ajax.call('poll',
			{
				lastLocation: GLOBAL.lastLocation,
				lastNote: GLOBAL.lastNote,
				lastNotice: GLOBAL.lastNotice,
				polltime: GLOBAL.polltime
			},
			pollReturn,
			pollReturn,
			true);
	}

	function pollReturn(data) {
		if (data && data.success) {

			GLOBAL.polltime = (data.polltime) ? data.polltime : GLOBAL.polltime;
			var i;
			for (i=0; i<data.locations.length; i++) {
				
				Trip.addLocation(data.locations[i]);
			}
			for (i=0; i<data.notes.length; i++) {
				
				Trip.addNote(data.notes[i], true);
			}
			if (GLOBAL.isAdmin) {
				for (i=0; i<data.notices.length; i++) {
					
					Notice.addNotice(data.notices[i]);
				}
			}
		}
		poll();
	}

	function openShareModal() {
		Modal.load(
			'/views/modal/shareTrip.html',
			function() {
				$('.text-box', $('#modalContent')).html(window.location.href.replace("#", ""));
				$('#doneButton').click(function() {
					$('#doneButton').unbind('click');
					Modal.close()
				});
			},
			'share-modal'
			);

		return false;

	}
	
	return {
		init : init,
		loadBlock: loadBlock,
		loadRelease: loadRelease,
		queueLinkCheck: queueLinkCheck,
		poll: poll
	};
	
}());
