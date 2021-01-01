const express = require('express');
const defaultController = require('../controllers/defaultController');
const router = express.Router();

router.get('/', defaultController.home_page);

router.get('/menu', defaultController.menu_page);

router.get('/greenhouse-onemonth', defaultController.greenhouse_onemonth_page);

router.get('/greenhouse-sixmonths', defaultController.greenhouse_sixmonths_page);

router.get('/greenhouse-alltime', defaultController.greenhouse_alltime_page);

router.get('/error', defaultController.error_page);

module.exports = router;


