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
	lastNotice: 0
};

var TransitionController = (function() {

	var prefix = '';
	
	function transitionEnd($obj, callback) {
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

	function showLostTrip() {
		$("#landingPage").addClass('hidden');
		$("#txtTripName").prop('disabled', true);

		$("#lostTripPage").removeClass('hidden');
		$("#txtAdminEmail").prop('disabled', false).focus();
	}

	function showLocation() {
		$("#infoPage").addClass('hidden');
		$("#locationPage").removeClass('hidden');
		var options = {
		  types: ['(regions)']
		};
		autocomplete = new google.maps.places.Autocomplete(document.getElementById('txtLocation'), options);
	}

	function createTrip() {

		//validate

		var name = $("#txtName").val();
		var email = $("#txtEmail").val();
		var tripName = $("#txtTripName").val();
		var location = $("#txtLocation").val();

		Main.loadBlock();
		Ajax.call('createTrip',
			{
				name: name,
				email: email,
				tripName: tripName,
				location: location
			},
			createTripReturn
		);
	}

	function sendEmail() {
		//validate

		var adminEmail = $("#txtAdminEmail").val();
		Main.loadBlock();
		Ajax.call('sendEmail',
			{
				adminEmail: adminEmail
			},
			sendEmailReturn
		);
	}

	function createTripReturn(data) {

		//check for success
		window.location = '/' + data.tripHash;

	}

	function sendEmailReturn(data) {
		Main.loadRelease();

		$("#lostTripPage").addClass('hidden');
		$("#txtAdminEmail").prop('disabled', true);

		$("#sentEmailPage").removeClass('hidden');
	}

	return {
		showInfo: showInfo,
		showLocation: showLocation,
		createTrip: createTrip,
		showLostTrip: showLostTrip,
		sendEmail: sendEmail
	};

}());

function Location(data, isLast) {
	this.name = data.name;
	this.id = data.id;
	this.listOrder = data.listOrder;
	this.lat = data.lat;
	this.lng = data.lng;

	this.$element = null;
	this.$notesElement = null;

	this.notes = [];

	var isLast = (typeof isLast === "undefined") ? false : isLast;

	this.$element = $("#clsLocation").clone(true).attr('id', 'location_' + this.id);
	this.$element.html(this.$element.html().replace(/\$LOCATION\$/g, this.name).replace(/\$LOCATION_ID\$/g, this.id));
	this.$element.attr('data-order', this.listOrder);

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
		$('.note-delete', $note).click({ location: this, noteId: note.id }, this.deleteNoteClickHandler);
	} else {
		$('.note-delete', $note).remove();
	}

	note.$element = $note;
	this.notes[note.id] = note;

	if (note.linkCheck <= (new Date().valueOf() / 1000)) {
		Main.queueLinkCheck(this, note.id, note.linkUrl);
	} 
	this.parseNote(note.id);

	this.$notesElement.append($note);

	if (animate) {
		$note.hide().show('slow');
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
				$('.note-text-wrapper', note.$element).css('display', 'none');
			} else {
				$('.note-text-wrapper', note.$element).css('display', '');
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

	if (!note.canDelete) return;

	Ajax.call('deleteNote', 
		{ 
			noteId: note.id

		},
		function() {
			$("#note_" + note.id ).remove();
			
		},
		function() {
			//error
		});
};

var NoteEditor = (function() {

	var $noteEditor;
	var $txtNoteText;
	var $txtNameText;
	var linkTimeout;
	var isInit = false;
	var isEditing = false;

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
		var noteText = $.trim($("#txtNoteText").val());
		var categoryId = $('#selCategory').val();
		var fromName = $.trim($('#txtFromName').val());


		if (fromName == '') {
			fromName = 'Anonymous';
		}

		var location = event.data.currentLocation;

		$.cookie('from', fromName, { expires: 365, path: '/' });

		//TODO form error checking, loading
		
		$("#noteEditorBlocker").removeClass('hidden');

		Ajax.call('addNote', 
			{
				noteText: noteText,
				fromName: fromName,
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

		$('.add-note-link', location.$element).click({location: location}, addNoteClickHandler);
	}

	function addNote(note, animate) {
		if (typeof locations[note.locationId] !== "undefined") {
			locations[note.locationId].location.addNote(note, animate);
		}
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
			google.maps.event.removeEventListener(locations[locationId].marker, 'click');
		}

		locations[locationId].destroy();

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

	function markerClickHandler(event) {
		console.log(event);
	}

	function getTripInfo() {
		return {
			tripName: tripName,
			tripAuthor: tripAuthor
		};
	}

	return {
		loadTrip: loadTrip,
		addLocation: addLocation,
		addNote: addNote,
		deleteLocation: deleteLocation,
		getTripInfo: getTripInfo
	}
}());

var Home = (function() {

	var $txtTripName = null;
	var $nextButton = null;

	var $startPage = null;
	var $infoPage = null;
	var $locationPage = null;
	var $lostTripPage = null;
	var $sentEmailPage = null;

	var $currentPage = null;

	var $txts = [];
	var isTransition = false;

	function init(page) {
		
		$('.next-button').click(nextPage);
		$('.create-button').click(nextPage);
		
		switch (page) {
			case 'lost':
				$lostTripPage = $("#lostTripPage");
				$sentEmailPage = $("#sentEmailPage");
				$currentPage = $lostTripPage;
				initLostTripPage();
				break;

			default:
				$startPage = $("#startPage");
				$infoPage = $("#infoPage");
				$locationPage = $("#locationPage");
				$currentPage = $startPage;
				initStartPage();
				break;
		}

		$(document).keydown(function(e) {
			switch (e.which) {
				case 13:
					nextPage();
					break;
			}
		});

		
		
	}

	function validateEmail(email) { 
    	var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    	return re.test(email);
	} 

	function txtChange(e) {
		var txtValid = true;
		for (var i=0, len=$txts.length; i<len; i++) {
			if ($.trim($txts[i].val()) == '') {
				txtValid = false;
			}
			if ($txts[i].hasClass('error')) {
				$txts[i].removeClass('error');
			}
		}

		if (txtValid) {
			$nextButton.removeClass('hidden');
		} else {
			$nextButton.addClass('hidden');
		}
	}


	function initStartPage() {
		isTransition = false;
		$txts = [$("#txtTripName")];
		$txts[0].prop('disabled', false).keyup(txtChange).focus();
		$nextButton = $('.next-button', $startPage);
	}
	function dinitStartPage() {
		$txts[0].val($.trim($txts[0].val()));
		$txts[0].prop('disabled', true).unbind('keyup');
	}

	function initInfoPage() {
		isTransition = false;
		$txts = [$("#txtName"), $("#txtEmail")];
		$txts[0].prop('disabled', false).keyup(txtChange).focus();
		$txts[1].prop('disabled', false).keyup(txtChange);
		$nextButton = $('.next-button', $infoPage);
	}
	function dinitInfoPage() {
		$txts[0].prop('disabled', true).unbind('keyup');
		$txts[1].prop('disabled', true).unbind('keyup');
		$txts[0].val($.trim($txts[0].val()));
		$txts[1].val($.trim($txts[1].val()));
	}

	function initLocationPage() {
		isTransition = false;
		$txts = [$("#txtLocation")];
		$txts[0].prop('disabled', false).keyup(txtChange).focus();
		$nextButton = $('.create-button', $locationPage);

		var options = {
		  types: ['(regions)']
		};
		var autocomplete = new google.maps.places.Autocomplete($txts[0][0], options);
	}
	function dinitLocationPage() {
		$txts[0].prop('disabled', true).unbind('keyup');
	}

	function initLostTripPage() {
		isTransition = false;
		$txts = [$("#txtEmail")];
		$txts[0].prop('disabled', false).keyup(txtChange).focus();
		$nextButton = $('.next-button', $startPage);
	}
	function dinitLostTripPage() {
		$txts[0].val($.trim($txts[0].val()));
		$txts[0].prop('disabled', true).unbind('keyup');
	}

	function backPage() {
		if (isTransition) return;
		isTransition = true;

		var initFunc;
		$currentPage.removeClass('page-current').addClass('page-right');
		switch($currentPage) {

			case $infoPage:
				dinitInfoPage();
				$currentPage = $startPage;
				initFunc = initStartPage;
				break;

			case $locationPage:
				dinitLocationPage();
				$currentPage = $infoPage;
				initFunc = initInfoPage;
				break;
		}
		$currentPage.removeClass('page-left').addClass('page-current');
		TransitionController.transitionEnd($currentPage, initFunc);
	}

	function nextPage() {
		if (isTransition) return;
		if ($nextButton.hasClass('hidden')) return;
		
		var initFunc;
		
		switch($currentPage) {
			
			case $startPage:
				isTransition = true;
				$currentPage.removeClass('page-current').addClass('page-left');
				dinitStartPage();

				$('.trip-title').html($txts[0].val());
				$currentPage = $infoPage;
				initFunc = initInfoPage;
				break;

			case $infoPage:
				if (!validateEmail($txts[1].val())) {
					$txts[1].addClass('error');
					return;
				}
				isTransition = true;
				$currentPage.removeClass('page-current').addClass('page-left');
				dinitInfoPage();
				$('.trip-subtitle').html("by " + $txts[0].val());
				$('.email').html($txts[1].val());
				$currentPage = $locationPage;
				initFunc = initLocationPage;
				break;

			case $locationPage:
				createTrip();
				break;

			case $lostTripPage:
				if (!validateEmail($txts[0].val())) {
					$txts[0].addClass('error');
					return;
				}
				sendEmail();
				break;
		}
		$currentPage.removeClass('page-right').addClass('page-current');
		TransitionController.transitionEnd($currentPage, initFunc);
	}

	function showLocation() {
		$("#infoPage").addClass('hidden');
		$("#locationPage").removeClass('hidden');
		
	}

	function createTrip() {

		//validate

		var name = $("#txtName").val();
		var email = $("#txtEmail").val();
		var tripName = $("#txtTripName").val();
		var location = $("#txtLocation").val();

		Main.loadBlock();
		Ajax.call('createTrip',
			{
				name: name,
				email: email,
				tripName: tripName,
				location: location
			},
			createTripReturn
		);
	}

	function sendEmail() {
		//validate

		var adminEmail = $("#txtEmail").val();
		Main.loadBlock();
		Ajax.call('sendEmail',
			{
				adminEmail: adminEmail
			},
			sendEmailReturn
		);
	}

	function createTripReturn(data) {

		//check for success
		window.location = '/' + data.tripHash;

	}

	function sendEmailReturn(data) {
		Main.loadRelease();
		
		isTransition = true;
		$currentPage.removeClass('page-current').addClass('page-left');
		dinitLostTripPage();

		$currentPage = $sentEmailPage;
		$currentPage.removeClass('page-right').addClass('page-current');

	}

	return {
		init: init
	};

}());

var Main = (function() {

	
	var linkQueue = [];
	
	function init(obj) {
		
		Ajax.init(obj.a);
		GLOBAL.isAdmin = obj.isAdmin;
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
	
	return {
		init : init,
		loadBlock: loadBlock,
		loadRelease: loadRelease,
		queueLinkCheck: queueLinkCheck,
		poll: poll
	};
	
}());
