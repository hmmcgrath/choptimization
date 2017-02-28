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
  res.render('index', {patients: patients});
});

router.get('/patient', function(req, res, next){
	res.render('addPatient', {});
});

router.post('/patient', function(req, res, next) {
	var current_date = moment().tz('America/New_York').valueOf().toString();
	var random = Math.random().toString();
	var hash = crypto.createHash('sha1').update(current_date + random).digest('hex');

	// Set all of patient's data
	var patient = {}
	var timeOfAdmit = moment().tz('America/New_York');
	patient.timeOfAdmit = timeOfAdmit.format('hh:mm') + (timeOfAdmit.hour() < 12 ? ' am' : 'pm');
	patient.id = hash;
	updatePatientData(patient, req.body);

	patients.push(patient);
	res.redirect('/list');
});

// Get the form view to update a patient's information
router.get('/patient/:id', function(req, res, next) {
	var idx = patients.findIndex(function(patient) {
		return patient.id === req.params.id;
	});
	res.render('updatePatient', {id: req.params.id, patient: patients[idx]});
});

// Submit the form data to update a patient's data
router.post('/patient/:id', function(req, res, next) {
	var idx = patients.findIndex(function(patient) {
		return patient.id === req.params.id;
	});
	updatePatientData(patients[idx], req.body);
	res.redirect('/list');
});

router.delete('/patient/:id', function(req, res, next) {
	patients = patients.filter(function(patient) {
		return patient.id !== req.params.id;
	});
	res.json({success: true});
});

function calculateScore(census, status) {
	if (status === 'MRFT') {
		return Math.round(61.6 - 0.075*minsToChange());
	} 
	else if (status === 'Bed Assigned') {
		return Math.round(7.8);
	}
	else if (status === 'Bed Approved') {
		return Math.round(13.59 + 9.88*(census === 'High' ? 1 : 0));
	}
	else if (status === 'MD/RN Started') {
		return Math.round(65.67 - .058*minsToChange());
	}
	else if (status === 'MD/RN Complete') {
		return Math.round(28.2);
	}
	else {
		return '';
	}
}

function minsToChange() {
	var now = moment().tz('America/New_York');
	var year = now.year();
	var month = now.month();
	var day = now.date();

	if (now.hour() < 7) {
		var diff =  moment.tz([year,month,day,7], 'America/New_York').diff(now)/1000/60;
	} 
	else if (now.hour() < 19) {
		var diff = moment.tz([year,month,day,19], 'America/New_York').diff(now)/1000/60;
	}
	else {
		var diff = moment.tz([year,month,day+1,7], 'America/New_York').diff(now)/1000/60;
	}
	return diff;
}

function updatePatientData(patient, formData) {
	var dob = moment.tz(formData.dob, 'America/New_York');

	patient.name = formData.name;
	patient.unit = formData.unit;
	patient.census = formData.census;
	patient.status = formData.status;
	patient.transferTime = calculateScore(patient.census, patient.status) + ' mins';

	// Set the patient's date of birth. Formatted differently for the
	// form view and the list view
	patient.dobList = dob.format('MM-DD-YYYY');
	patient.dobForm = dob.format('YYYY-MM-DD');
}

// Update the waiting times every 5 seconds
setInterval(function() {
  	patients.forEach(function(patient) {
		patient.transferTime = calculateScore(patient.census, patient.status) + ' mins';
	});
}, 5000);

module.exports = router;
