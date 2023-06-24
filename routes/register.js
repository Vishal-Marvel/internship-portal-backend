const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/student/signup/', authController.signUp);

module.exports = router;
