const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const studentController = require('../controllers/studentController');

router.post('/signup', authController.studentSignUp);
router.post('/login', authController.studentLogin);

router.use(authController.protect)
router.route('/:id')
    .get(studentController.viewStudent)
    .put(studentController.updateStudent)
    .delete(studentController.deleteStudent);
router.get('/:id/internships', studentController.viewStudentInternship);

module.exports = router;
