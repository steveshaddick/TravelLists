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

	var wait = false;
	var needScroll = true;
	var $doc;
	var lastLocationName = '';
	var $stickyLocation;

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
				$(document).on('click', '.note-delete>a', checkNoteDelete);

				Main.poll();
				checkScroll();
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

		$stickyLocation = $("#stickyLocation");
		$doc = $(document);
		$(window).scroll(checkScroll);

	}

	function checkNoteDelete(event) {
		var $target = $(event.currentTarget);
		var locationId = $target.attr('data-location');
		var noteId = $target.attr('data-note');

		locations[locationId].location.deleteNote(noteId);

		return false;
	}

	function checkScroll() {

		if (wait) {
			needScroll = true;
			return;
		}

		var scrollTop = $doc.scrollTop();

		var locationName = '';
		for (var location in locations) {
			if ((scrollTop > locations[location].location.$element.offset().top + 50)  && (scrollTop < locations[location].location.$element.offset().top + locations[location].location.$element.height() - 200)){
				locationName = locations[location].location.name;
				break;
			} else {
				locationName = '';
			}
		}

		if (locationName != lastLocationName) {
			lastLocationName = locationName;
			if (locationName != '') {
				$stickyLocation.css('top', 0);
				$('.location-name', $stickyLocation).html(locationName).attr('href', "#" + locations[location].location.hash);
			} else {
				$stickyLocation.css('top', '');
			}
		}

		needScroll = false;
		wait = true;
		setTimeout(function(){ wait = false; if (needScroll) checkScroll(); }, 50);
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

	function forceCollapseNotes() {
		for (var loc in locations) {
			locations[loc].location.forceCollapse();
		}
	}
	function reExpandNotes() {
		for (var loc in locations) {
			locations[loc].location.reExpand();
		}
	}

	return {
		loadTrip: loadTrip,
		addLocation: addLocation,
		addNote: addNote,
		deleteLocation: deleteLocation,
		reorderLocation: reorderLocation,
		getTripInfo: getTripInfo,
		forceCollapseNotes: forceCollapseNotes,
		reExpandNotes: reExpandNotes
	}
}());