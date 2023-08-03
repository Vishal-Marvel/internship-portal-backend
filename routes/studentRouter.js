const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const studentController = require('../controllers/studentController');
const skillController = require('../controllers/skillController');

router.post('/signup', authController.studentSignUp);
router.post('/login', authController.studentLogin);

router.use(authController.protect)
router.route('/:id')
    .put(studentController.updateStudent)
    .delete(studentController.deleteStudent);
router.get('/viewStudent/:id',authController.restrictTo('hod','principal','internshipcoordinator','mentor','ceo'),studentController.viewStudent);
router.get('/viewStudent',studentController.viewStudent);
router.get('/:id/internships', studentController.viewStudentInternship);
router.get('/getAllSkills', skillController.getAllSkills)
module.exports = router;
