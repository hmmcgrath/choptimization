var express = require('express');
var moment = require('moment');
var router = express.Router();

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
  	var formattedPatient = {};

  	formattedPatient.name = patient.name;
  	formattedPatient.dob = moment(patient.dob).format('MM/DD/YYYY');
  	formattedPatient.unit = patient.unit;
  	formattedPatient.census = patient.census;
  	formattedPatient.timeOfAdmit = moment(patient.timeOfAdmit).format('MM/DD/YYYY');
  	formattedPatient.transferTime = patient.transferTime + ' mins';

  	formattedPatients.push(formattedPatient);
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
	console.log(patients);
	res.redirect('/list');
});

router.post('/submitPatient/:id', function(req, res, next) {
	patients[req.params.id] = createPatient(req.body);
	console.log(patients);
	res.redirect('/list');
});

function createPatient(formData) {
	var patient = formData;
	patient.dob = parseInt(moment(patient.dob).valueOf());
	patient.timeOfAdmit = parseInt(moment().valueOf());
	patient.transferTime = calculateScore(patient.census, 0);
	return patient;
}

router.get('/updatePatient/:id', function(req, res, next) {
	formattedPatient = {};
	patient = patients[req.params.id];

	formattedPatient.name = patient.name;
  	formattedPatient.dob = moment(patient.dob).format('YYYY-MM-DD');
  	formattedPatient.unit = patient.unit;
  	formattedPatient.census = patient.census;
  	formattedPatient.timeOfAdmit = moment(patient.timeOfAdmit).format('YYYY-MM-DD');
  	formattedPatient.transferTime = patient.transferTime + ' mins';

	res.render('updatePatient', {id: req.params.id, patient: formattedPatient});
});

function calculateScore(census, minsToChange) {
	var score = 176.86 - 0.133*minsToChange;
	if (census === 'High') {
		score += 9.88;
	}
	return score;
}

module.exports = router;
