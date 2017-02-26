var express = require('express');
var moment = require('moment-timezone');
var router = express.Router();
var crypto = require('crypto');

var patients = [];

/* GET home page. */
router.get('/', function(req, res,next) {
	res.redirect('/list');
});

router.get('/list', function(req, res, next) {
  // Reformat the dates so that they are human readable without
  // changing the original object stored in memory
  formattedPatients = [];
  patients.forEach(function(patient) {
  	formattedPatients.push(formatPatient(patient, false));
  });
  res.render('index', {patients: formattedPatients});
});

router.get('/update', function(req, res, next){
	res.render('update', {});
});

router.get('/addPatient', function(req, res, next){
	res.render('addPatient', {});
});

router.post('/submitPatient', function(req, res, next) {
	patients.push(createPatient(req.body));
	res.redirect('/list');
});

router.post('/submitPatient/:id', function(req, res, next) {
	var idx = patients.findIndex(function(patient) {
		return patient.id === req.params.id;
	});
	updatePatient(patients[idx], req.body);
	res.redirect('/list');
});

router.get('/removePatient/:id', function(req, res, next) {
	patients = patients.filter(function(patient) {
		return patient.id !== req.params.id;
	});
	res.json({success: true});
});

router.get('/updatePatient/:id', function(req, res, next) {
	var idx = patients.findIndex(function(patient) {
		return patient.id === req.params.id;
	});
	var formattedPatient = formatPatient(patients[idx], true);
	res.render('updatePatient', {id: req.params.id, patient: formattedPatient});
});

function calculateScore(census) {
	var score = 176.86 - 0.133*minsToChange();
	if (census === 'High') {
		score += 9.88;
	}
	return Math.round(score);
}

function minsToChange() {
	var now = moment().tz('America/New York');
	var year = now.year();
	var month = now.month();
	var day = now.date();

	if (now.hour() < 7) {
		var diff =  moment([year,month,day,7]).tz('America/New York').diff(now)/1000/60;
	} 
	else if (now.hour() < 19) {
		var diff = moment([year,month,day,19]).tz('America/New York').diff(now)/1000/60;
	}
	else {
		var diff = moment([year,month,day+1,7]).tz('America/New York').diff(now)/1000/60;
	}
	return diff;
}

function createPatient(formData) {
	var current_date = moment().tz('America/New York').valueOf().toString();
	var random = Math.random().toString();
	var hash = crypto.createHash('sha1').update(current_date + random).digest('hex');

	patient = {};
	patient.name = formData.name;
	patient.dob = moment(formData.dob).tz('America/New York').valueOf();
	patient.unit = formData.unit;
	patient.census = formData.census;
	patient.transferTime = calculateScore(patient.census);
	patient.status = formData.status;
	patient.id = hash;
	patient.timeOfAdmit = moment().tz('America/New York').valueOf();

	return patient;
}

function updatePatient(patient, formData) {
	patient.name = formData.name;
	patient.dob = moment(formData.dob).tz('America/New York').valueOf();
	patient.unit = formData.unit;
	patient.census = formData.census;
	patient.transferTime = calculateScore(patient.census);
	patient.status = formData.status;
}

function formatPatient(patient, update) {
	var formattedPatient = {};

  	formattedPatient.name = patient.name;
  	formattedPatient.unit = patient.unit;
  	formattedPatient.census = patient.census;
  	formattedPatient.transferTime = patient.transferTime + ' mins';
  	formattedPatient.id = patient.id;
  	formattedPatient.status = patient.status;

  	if (!update) {
  		formattedPatient.dob = moment(patient.dob).tz('America/New York').format('MM-DD-YYYY');
  		var timeOfAdmit = moment(patient.timeOfAdmit).tz('America/New York');
  		if (timeOfAdmit.hour() < 12) {
  			formattedPatient.timeOfAdmit = timeOfAdmit.format('HH:mm') + ' am';
  		}
  		else {
  			formattedPatient.timeOfAdmit = timeOfAdmit.format('hh:mm') + ' pm';
  		}
  	}
  	else {
		formattedPatient.dob = moment(patient.dob).tz('America/New York').format('YYYY-MM-DD');
  	}

  	return formattedPatient;
}

// Update the waiting times every 5 seconds
setInterval(function() {
  	patients.forEach(function(patient) {
		patient.transferTime = calculateScore(patient.census);
	});
}, 5000);

module.exports = router;
