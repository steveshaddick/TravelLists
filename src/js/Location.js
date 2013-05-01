function Location(data, isLast) {
	this.name = data.name;
	this.id = data.id;
	this.listOrder = data.listOrder;
	this.lat = data.lat;
	this.lng = data.lng;
	this.isOpen = true;
	this.wasOpen = true;
	this.totalNotes = 0;

	this.topOffset = this.bottomOffset = 0;
	this.hash = '';

	this.text = [];
	this.text['suggestCTA'] = '';
	this.text['noteTextPlaceholder'] = '';

	this.$element = null;
	this.$notesElement = null;
	this.$showHideButton = null;
	this.$noteText = null;
	this.$noteEditor = null;

	this.notes = [];

	var isLast = (typeof isLast === "undefined") ? false : isLast;

	this.$element = $("#clsLocation").clone(true).attr('id', 'location_' + this.id);
	this.$element.html(this.$element.html().replace(/\$LOCATION\$/g, this.name).replace(/\$LOCATION_ID\$/g, this.id));
	this.$element.attr('data-order', this.listOrder);

	this.hash = (this.name.indexOf(',') > -1) ? this.name.substring(0, this.name.indexOf(',')) : this.name;
	$('.anchor', this.$element).attr('id', this.hash);

	this.$noteText = $(".txtNoteText", this.$element);
	this.$noteEditor = $(".note-editor", this.$element);
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
		$('.note-delete a', $note).removeClass('edit-mode').click({ location: this, noteId: note.id }, this.deleteNotenotecooClickHandler);
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
	this.expand();
	
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

			
		},
		function() {
			//error
		});

	return false;
};
Location.prototype.showHide = function(event) {
	var location = event.data.location;

	if (location.isOpen) {
		location.collapse();
	} else {
		location.expand();
	}

	return false;
};
Location.prototype.collapse = function() {
	this.cancelNote();
	$('.notes-hidden .number', this.$element).html(this.totalNotes);
	$('.notes-wrapper', this.$element).slideUp();
	$('.notes-hidden', this.$element).show();
	this.isOpen = false;
	this.$showHideButton.html('+').attr('title', 'Expand');
};
Location.prototype.expand = function() {
	$('.notes-wrapper', this.$element).slideDown();
	$('.notes-hidden', this.$element).hide();
	this.isOpen = true;
	this.$showHideButton.html('&#150;').attr('title', 'Collapse');
};
Location.prototype.forceCollapse = function() {
	this.wasOpen = this.isOpen;
	this.collapse();
};
Location.prototype.reExpand = function() {
	if (this.wasOpen) {
		this.expand();
	}
};
Location.prototype.noteTextFocus = function(event) {
	var location = event.data.location;

	if (GLOBAL.activeNoteLocation === location) return;
	if (GLOBAL.activeNoteLocation) {
		GLOBAL.activeNoteLocation.cancelNote();
	}
	location.editNote();
	
};
Location.prototype.noteTextBlur = function(event) {

	/*var location = event.data.location;

	if ($.trim(location.$noteText.val()) == '') {
		location.cancelNote();
		return;
	}*/

	
};
Location.prototype.editNote = function() {
	
	var me = this;
	GLOBAL.activeNoteLocation = this;

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

};
Location.prototype.cancelNote = function() {

	GLOBAL.activeNoteLocation = null;
	this.$noteEditor.off('focusout');

	$('.note-text-label', this.$element).removeClass('hidden');
	this.$noteText.attr('placeholder', this.text['noteTextPlaceholder']).removeClass('editing').unbind('keyup').val('').blur();

	$('#cls').append($('#clsCategorySelector')).append($('#clsNoteFrom')).append($('#clsSubmitNote'));

	$("#txtFromName").unbind('keyup');
	$("#submitNoteButton").unbind('click');
	$("#cancelNoteButton").unbind('click');

};
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
};