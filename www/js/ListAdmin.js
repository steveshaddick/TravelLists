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




var ListAdmin = (function() {

	var autocomplete = null;

	function init() {
		$('.addLocationLink').click(addLocation);
		$(document).on('click', '.deleteLocationLink', deleteLocation);

		var text = new EditText($("#tripTitle"), save);
		text = new EditText($("#tripSubtitle"), save);
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

	function save() {

		Ajax.call('saveTrip',
		{
			tripTitle: $("#tripTitle").html(),
			tripSubtitle: $("#tripSubtitle").html()
		});

	}

	return {
		init: init,
		save: save
	}

}());