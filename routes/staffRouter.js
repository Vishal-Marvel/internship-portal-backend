const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const staffController = require('../controllers/staffController');
const skillController = require('../controllers/skillController');
const multer = require('multer');
// Create an instance of multer for handling file uploads
const upload = multer({
    limits: {
        fileSize: 1048576 // 1 mb
    }
});
router.post('/signup', authController.staffSignup);
router.post('/login', authController.staffLogin);

router.use(authController.protect);
router.use(authController.doNotAllow("student"));
router.get('/mentee-students',authController.restrictTo('mentor'), staffController.viewMenteeStudents);
router.get('/:id/mentee-students', staffController.viewMenteeStudents);
router.put('/update', upload.single('file'),  staffController.updateStaff)
router.route('/:id')
    .put(authController.restrictTo('hod', 'admin', 'principal'),upload.single('file'),  staffController.updateStaff)
    .delete(authController.restrictTo('hod', 'admin', 'principal'), staffController.deleteStaff)
router.get('/viewStaff/:id',authController.restrictTo('hod','principal','ceo'),staffController.viewStaff);
router.get('/viewStaff',staffController.viewStaff);//for same logged in staff
router.get('/viewMultipleStaff',authController.restrictTo('hod','principal','ceo'), staffController.viewMultipleStaff);
router.get('/viewMultipleStudent',authController.restrictTo('hod','principal','ceo', "tapcell", "intershipcoordinator"),staffController.viewMultipleStudent);
router.use(authController.restrictTo("hod", "admin")); // router.use(authController.restrictTo(staffUpdateRoles));
router.post('/updateRole', staffController.updateRole);
router.get('/viewRoles', staffController.viewRoles);
router.post('/updateMentees', staffController.migrateMentees);
router.post('/addStaffs', upload.single('file'),  authController.multipleStaffSignup);
router.use(authController.restrictTo("hod", "admin", "tapcell", "principal", "ceo"));
router.post('/skill/addSkill', skillController.addSkill)
router.delete('/skill/deleteSkill', skillController.deleteSkill)
module.exports = router;
