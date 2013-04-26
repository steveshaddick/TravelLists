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