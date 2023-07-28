const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const staffController = require('../controllers/staffController');

router.post('/signup', authController.staffSignup);
router.post('/login', authController.staffLogin);

router.use(authController.protect);
router.use(authController.doNotAllow("student"));
router.get('/:id/mentee-students', staffController.viewMenteeStudents);
router.route('/:id')
    .get(staffController.viewStaff)
    .put(staffController.updateStaff)
    .delete(staffController.deleteStaff)

router.use(authController.restrictTo("hod", "admin")); // router.use(authController.restrictTo(staffUpdateRoles));
router.post('/assignRole', authController.assignRoles);
router.post('/updateMentees', staffController.migrateMentees);
module.exports = router;
