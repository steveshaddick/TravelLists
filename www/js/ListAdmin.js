var ListAdmin = (function() {

	var autocomplete = null;

	function init() {
		$('.addLocationLink').click(addLocation);
		$(document).on('click', '.deleteLocationLink', deleteLocation);
	}

	function addLocation() {
		Modal.load('/views/modal/addLocation.html', function() {
			var options = {
			  types: ['(regions)']
			};

			autocomplete = new google.maps.places.Autocomplete(document.getElementById('txtLocation'), options);

			$('.submitLocationLink').click(submitLocation);
		});
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
	}

	return {
		init: init
	}

}());