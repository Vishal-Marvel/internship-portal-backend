const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const studentController = require('../controllers/studentController');
const skillController = require('../controllers/skillController');
const multer = require("multer");
const upload = multer({
    limits: {
        fileSize: 1048576 // 1 mb
    }
});
router.post('/signup',upload.single('file'), authController.studentSignUp);
router.post('/login', authController.studentLogin);

router.use(authController.protect)

router.put('/update', authController.restrictTo('student'), studentController.updateStudent);
router.get('/viewStudent/:id',authController.restrictTo('hod','principal','internshipcoordinator','mentor','ceo'),studentController.viewStudent);
router.get('/viewStudent',studentController.viewStudent);
router.get('/:id/internships', studentController.viewStudentInternship);
router.get('/getAllSkills', skillController.getAllSkills)
router.use(authController.doNotAllow('student'))
router.route('/:id')
    .put(studentController.updateStudentByStaff)
    .delete(studentController.deleteStudent);
module.exports = router;
