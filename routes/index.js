var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  var score = calculateScore();
  res.render('index', { score: score });
});


router.get('/submitForm', function(req, res, next) {
	// Request contains all of the information about the patient
	// run your algorithm here
	var time = new Time();
	var busy = req.params.busy

});


router.get('/update', function(req, res, next){
	res.render('update', {});
});

router.get('/submit', function(req, res, next){
	res.render('submit', {});
});

function calculateScore() {
	return 5
}

module.exports = router;
