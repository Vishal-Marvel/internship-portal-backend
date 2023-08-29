const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const staffController = require('../controllers/staffController');
const skillController = require('../controllers/skillController');
const notificationController = require('../controllers/notificationController');
const multer = require('multer');
// Create an instance of multer for handling file uploads
const upload = multer({
    limits: {
        fileSize: 524288 // 512 kb
    }
});
router.post('/signup', upload.single('file'), authController.staffSignup);
router.post('/login', authController.staffLogin);
router.post('/forgot-password', authController.staffForgotPasswordReq);
router.post('/set-forgot-password', authController.staffForgotPasswordRes);

router.use(authController.protect);
router.get('/:dept/mentors', staffController.getDepartMentors);
router.post('/change-password', authController.changePassword);
router.use(authController.doNotAllow("student"));
router.get('/mentee-students', authController.restrictTo('mentor'), staffController.viewMenteeStudents);
router.get('/:id/mentee-students', staffController.viewMenteeStudents);
router.put('/update', upload.single('file'), staffController.updateStaff)
router.get('/viewMultipleStudent', staffController.viewMultipleStudent);
router.get('/viewStaff', staffController.viewStaff);//for same logged in staff
router.get('/viewAllRoles', staffController.getAllRoles);
router.post('/create', notificationController.createNotification);

router.use(authController.restrictTo("hod", "tapcell", "principal", "ceo", "admin"));
router.post('/updateRole', staffController.updateRole);
router.get('/viewStaffRoles/:id', staffController.viewRoles);
router.post('/updateMentees', staffController.migrateMentees);
router.get('/viewMultipleStaff', staffController.viewMultipleStaff);
router.get('/viewStaff/:id', staffController.viewStaff);
router.post('/addStaffs', upload.single('file'), authController.multipleStaffSignup);
router.route('/:id')
    .put(upload.single('file'), staffController.updateStaff)
    .delete(staffController.deleteStaff)

router.post('/skill/addSkill', skillController.addSkill)
router.delete('/skill/deleteSkill', skillController.deleteSkill)

module.exports = router;
