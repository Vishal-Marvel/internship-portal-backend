const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const staffController = require('../controllers/staffController');

router.post('/signup', authController.staffSignup);
router.post('/login', authController.staffLogin);
router.get('/students', staffController.viewStudents);
router.get('/', staffController.viewStaff);
router.put('/', staffController.updateStaff);
module.exports = router;
