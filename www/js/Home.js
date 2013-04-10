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
		$('.back-button').click(backPage);
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
		txtChange();
	}
	function dinitStartPage() {
		$txts[0].val($.trim($txts[0].val()));
		$txts[0].prop('disabled', true).unbind('keyup');
		$nextButton.addClass('hidden');
	}

	function initInfoPage() {
		isTransition = false;
		$txts = [$("#txtName"), $("#txtEmail")];
		$txts[0].prop('disabled', false).keyup(txtChange).focus();
		$txts[1].prop('disabled', false).keyup(txtChange);
		$nextButton = $('.next-button', $infoPage);
		$('.back-button', $infoPage).removeClass('hidden');
		txtChange();
	}
	function dinitInfoPage() {
		$txts[0].prop('disabled', true).unbind('keyup');
		$txts[1].prop('disabled', true).unbind('keyup');
		$txts[0].val($.trim($txts[0].val()));
		$txts[1].val($.trim($txts[1].val()));
		$nextButton.addClass('hidden');
		$('.back-button', $infoPage).addClass('hidden');
	}

	function initLocationPage() {
		isTransition = false;
		$txts = [$("#txtLocation")];
		$txts[0].prop('disabled', false).keyup(txtChange).focus();
		$nextButton = $('.create-button', $locationPage);
		$('.back-button', $locationPage).removeClass('hidden');
		txtChange();

		var options = {
		  types: ['(regions)']
		};
		var autocomplete = new google.maps.places.Autocomplete($txts[0][0], options);
	}
	function dinitLocationPage() {
		$txts[0].prop('disabled', true).unbind('keyup');
		$nextButton.addClass('hidden');
		$('.back-button', $locationPage).addClass('hidden');
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
		if ($nextButton.hasClass('hidden')) {
			if (($txts) && ($txts.length > 1)) {
				for (var i=0, len = $txts.length - 1; i<len; i++) {
					if ($txts[i].is(":focus")) {
						$txts[i + 1].focus();
						break;
					}
				}
			}
			return;
		}
		
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
		
		var adminEmail = $("#txtEmail").val();

		if (!validateEmail(adminEmail)) {
			$("#txtEmail").addClass('error');
			return;
		}

		Main.loadBlock();
		Ajax.call('sendEmail',
			{
				adminEmail: adminEmail
			},
			sendEmailReturn
		);
	}

	function createTripReturn(data) {

		if (data.success) {
			window.location = '/' + data.tripHash;

		} else {
			alert("ERROR!");
		}
		//check for success

	}

	function sendEmailReturn(data) {
		Main.loadRelease();

		if (data.message == 'no trips') {
			alert('No trips were found.');
			return;
		}
		
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