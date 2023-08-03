const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const staffController = require('../controllers/staffController');
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
router.route('/:id')
    .put(staffController.updateStaff)
    .delete(staffController.deleteStaff)
router.get('/viewStaff/:id',authController.restrictTo('hod','principal','ceo'),staffController.viewStaff);
router.get('/viewStaff',staffController.viewStaff);//for same logged in staff
router.get('/viewMultipleStaff',staffController.viewMultipleStaff);
router.get('/viewMultipleStudent',staffController.viewMultipleStudent);
router.use(authController.restrictTo("hod", "admin")); // router.use(authController.restrictTo(staffUpdateRoles));
router.post('/assignRole', authController.assignRoles);
router.post('/updateMentees', staffController.migrateMentees);
router.post('/addStaffs', upload.single('file'),  authController.staffsSignup)
module.exports = router;
