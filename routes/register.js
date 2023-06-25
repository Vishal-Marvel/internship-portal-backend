const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const viewController = require('../controllers/staffController');

router.post('/student/signup/', authController.studentSignUp);
router.post('/staff/signup/', authController.staffSignup);
router.get('/staffs/:id', viewController.viewStudents);

module.exports = router;
