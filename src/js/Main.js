if (typeof console == "undefined") {
	console = {
		log: function() {}
	};
}

var GLOBAL = {
	isEditMode: false,
	polltime: 15000,
	lastLocation: 0,
	lastNote: 0,
	lastNotice: 0,
	activeNoteLocation: null,
	noteCookie: false,
	skipPoll: false
};

/*var pHold = [];
var fakeId = 0;
var immediateTimeout = false;
function p(selector, context, hold) {
	var cp = "none";
	if (context) {
		if (context[0].id === "") {
			context[0].id = cp = "___" + fakeId;
			fakeId ++;
			pHold[cp] = [];
		}
	}
	if (pHold[cp][selector]) {
		return pHold[cp][selector];
	} else {
		pHold[cp][selector] = $(selector, context);
		if (!immediateTimeout) {
			setTimeout(function() {
				pHold[cp][selector] = null;
			});
		}
	}
}*/

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
	};
}());

var Settings = (function() {

	var isInit = false;
	var isOpen = false;


	function open() {
		$("txtTripName").val();
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

		if (url == '') return;

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
		if (GLOBAL.skipPoll) {
			poll();
			return;
		}

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
				$('.text-box', $('#modalContent')).val("http://" + window.location.hostname + window.location.pathname).select();
				$('#doneButton').click(function() {
					$('#doneButton').unbind('click');
					Modal.close();
					return false;
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
