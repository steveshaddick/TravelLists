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
	};
}());

var EditMode = (function() {

	var autocomplete = null;
	var editTitle;
	var editSubtitle;
	var editNotes = [];

	function init() {
		$(".edit-mode").removeClass('edit-off');
		if (GLOBAL.activeNoteLocation) {
			GLOBAL.activeNoteLocation.cancelNote();
		}
		$(".add-note").addClass('hidden');
		$("header").addClass('edit-on');
		$("#map").addClass('edit-on');

		$("#addLocationButton").click(openLocationModal);
		$(document).on('click', '.delete-location-button', deleteLocation).on('click', '.location-up', reorderLocation).on('click', '.location-down', reorderLocation);
		$("#editDoneButton").click(dinit);

		editTitle = new EditText($("#tripTitle"), function() { save({tripTitle:$("#tripTitle").html() }); });
		editSubtitle = new EditText($("#tripSubtitle"), function() { save({tripSubtitle:$("#tripSubtitle").html() }); });

		/*$('.note-text').each(function( index ) {
			editNotes.push(new EditText($(this), saveNote));
		});*/

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
		/*for (var i=0; i<editNotes.length; i++) {
			editNotes[i].destroy();
		}
		editNotes = [];*/

		$("#editBar").slideUp();

		return false;
	}

	function openLocationModal() {
		$('html, body').scrollTop(0);
		Modal.load('/views/modal/addLocation.html', function() {
			var options = {
				types: ['(regions)']
			};
			autocomplete = new google.maps.places.Autocomplete(document.getElementById('txtLocation'), options);

			Modal.jQ('.submit-location-link').click(submitLocation);
			Modal.jQ('.cancel-link').click(closeLocationModal);
		},
		'location-modal');

		return false;
	}

	function submitLocation() {
		var location = $('#txtLocation').val();
		$('#txtLocation').prop('disabled', true);

		Ajax.call('addLocation', {location: location},
			function(data) {
				closeLocationModal();
				Trip.addLocation(data);
			},
			function() {
				$('#txtLocation').val('');
				$('#txtLocation').prop('disabled', false);
			});

		return false;
	}

	function closeLocationModal() {
			autocomplete = null;
			Modal.jQ('.submit-location-link').unbind('click');
			Modal.jQ('.cancel-link').unbind('click');
			Modal.close();

		return false;
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

	function saveNote($note) {
		save($note.html());
	}

	function save(data) {

		Ajax.call('saveTrip', data);

	}

	return {
		init: init,
		dinit: dinit
	};

}());

var EditText = function($element, saveCallback) {

	this.$element = $element;
	this.saveCallback = saveCallback;

	this.$divWrapper = $('<div class="edit-text"><input type="text" disabled="disabled" class="editTextInput" /></div>');
	this.$divWrapper.addClass(this.$element.attr('class'));

	this.$input = $('.editTextInput', this.$divWrapper).css('display', 'none');

	this.$element.after(this.$divWrapper);
	this.$divWrapper.append(this.$element);
	this.$input.val(this.$element.html());

	this.$divWrapper.click({editText: this}, this.onClickHandler);
};

EditText.prototype.onClickHandler = function(event) {

	var editText = event.data.editText;

	editText.$input.css('display', '').prop('disabled', false).attr('class', 'editTextInput ' + editText.$element.attr('class'));
	editText.$element.css('display', 'none');

	editText.$divWrapper.unbind('click');

	editText.$input.select().blur({editText: editText}, editText.finishText).keypress({editText: editText}, editText.onKeypress);

};

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
};

EditText.prototype.finishText = function(event) {

	var editText = event.data.editText;
	editText.$input.prop('disabled', true).unbind('blur').unbind('keypress').css('display', 'none');

	editText.$element.css('display', '').html(editText.$input.val());

	editText.$divWrapper.click({editText: editText}, editText.onClickHandler);

	if (typeof event.data.noSave == "undefined") {
		editText.saveCallback(editText.$element);
	}
};

EditText.prototype.destroy = function() {
	
	this.$divWrapper.unbind('click');
	this.$divWrapper.before(this.$element);
	this.$divWrapper.remove();
	this.$divWrapper = null;
	this.$input.remove();
	this.$input = null;
	this.$element = null;
	this.saveCallback = null;
};
