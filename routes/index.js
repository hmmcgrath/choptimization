var express = require('express');
var moment = require('moment');
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
	patients[idx] = createPatient(req.body);
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

function calculateScore(census, minsToChange) {
	var score = 176.86 - 0.133*minsToChange;
	if (census === 'High') {
		score += 9.88;
	}
	return score;
}

function createPatient(formData) {
	var current_date = moment().valueOf().toString();
	var random = Math.random().toString();
	var hash = crypto.createHash('sha1').update(current_date + random).digest('hex');

	var patient = formData;
	patient.dob = parseInt(moment(patient.dob).valueOf());
	patient.timeOfAdmit = parseInt(moment().valueOf());
	patient.transferTime = calculateScore(patient.census, 0);
	patient.id = hash;
	return patient;
}

function formatPatient(patient, update) {
	var formattedPatient = {};

  	formattedPatient.name = patient.name;
  	formattedPatient.unit = patient.unit;
  	formattedPatient.census = patient.census;
  	formattedPatient.transferTime = patient.transferTime + ' mins';
  	formattedPatient.id = patient.id;

  	if (!update) {
  		formattedPatient.dob = moment(patient.dob).format('MM/DD/YYYY');
  		formattedPatient.timeOfAdmit = moment(patient.timeOfAdmit).format('MM/DD/YYYY');
  	}
  	else {
		formattedPatient.dob = moment(patient.dob).format('YYYY-MM-DD');
  		formattedPatient.timeOfAdmit = moment(patient.timeOfAdmit).format('YYYY-MM-DD');	
  	}

  	return formattedPatient;
}

module.exports = router;
