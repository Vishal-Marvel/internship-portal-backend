const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const studentController = require('../controllers/studentController');

router.post('/signup', authController.studentSignUp);
router.post('/login', authController.studentLogin);

router.use(authController.protect)
router.route('/')
    .get(studentController.viewStudent)
    .put(studentController.updateStudent);
    
router.get('/internships', studentController.viewStudentInternship);

module.exports = router;
