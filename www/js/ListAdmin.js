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


var ListAdmin = (function() {

	var autocomplete = null;

	function init(notices) {
		$('.add-location-link').click(addLocation);
		$(document).on('click', '.delete-location-link', deleteLocation);

		var text = new EditText($("#tripTitle"), function() {
			save({tripTitle: $("#tripTitle").html()});
		});
		text = new EditText($("#tripSubtitle"), function() {
			save({tripSubtitle: $("#tripSubtitle").html()});
		});

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

	function addLocation() {
		$('html, body').scrollTop(0);
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

	function save(data) {

		Ajax.call('saveTrip', data);

	}

	function sortNotes(event, ui) {
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
	}

	return {
		init: init,
		save: save,
		sortNotes: sortNotes
	}

}());