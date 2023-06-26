const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const studentController = require('../controllers/studentController');

router.post('/signup', authController.studentSignUp);
router.post('/login', authController.studentLogin);
router.get('/', studentController.viewStudent);
router.get('/internships', studentController.viewStudentInternship);
router.put('/', studentController.updateStudent);

module.exports = router;
