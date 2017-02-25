(function($) {
	$(function() {
		
		$('tr').click(function(ev) {
			window.location.href= '/updatePatient/' + $(ev.delegateTarget).attr('id');
		});


	});
})(jQuery)