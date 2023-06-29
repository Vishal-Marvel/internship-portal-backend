const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const staffController = require('../controllers/staffController');

router.post('/signup', authController.staffSignup);
router.post('/login', authController.staffLogin);

router.use(authController.protect);
router.use(authController.restrictTo("mentor", "hod", "tap-cell", "principal"));
router.get('/students', staffController.viewStudents);
router.route('/')
    .get(staffController.viewStaff)
    .put(staffController.updateStaff)
    .delete(staffController.deleteStaff)

module.exports = router;
