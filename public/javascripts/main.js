(function($) {
	$(function() {
		var removingPatient = false;

		$('tbody>tr').click(function(ev) {
			if (!removingPatient) {
				window.location.href= '/patient/' + $(ev.delegateTarget).attr('id');
			}
		});

		$('button').click(function(ev) {
			if (removingPatient) {
				return;
			}

			removingPatient = true;
			trow = $(ev.delegateTarget).parents('tr');
			id = trow.attr('id');

			$.ajax({
				url: '/patient/' + id,
				type: 'DELETE',
				success: function(data) {
					removingPatient = false;
					trow.remove();
				}
			});

			ev.stopPropagation();
		});
	});


})(jQuery)