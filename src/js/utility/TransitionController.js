var TransitionController = (function() {

	var prefix = '';
	
	function transitionEnd($obj, callback) {
		if (typeof callback == "undefined") {
			return;
		}
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