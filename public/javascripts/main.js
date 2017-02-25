(function($) {
	$(function() {
		var removingPatient = false;

		$('tbody>tr').click(function(ev) {
			if (!removingPatient) {
				window.location.href= '/updatePatient/' + $(ev.delegateTarget).attr('id');
			}
		});

		$('button').click(function(ev) {
			if (removingPatient) {
				return;
			}

			removingPatient = true;
			trow = $(ev.delegateTarget).parents('tr');
			id = trow.attr('id');

			$.get('/removePatient/' + id, function(data) {
				removingPatient = false;
				trow.remove();
			});

			ev.stopPropagation();
		});
	});


})(jQuery)