const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const staffController = require('../controllers/staffController');

// router.post('/init', authController.performStartupTasks)
router.use(authController.protect);
router.use(authController.restrictTo("admin"));
router.post('/addRole', authController.addRole);
router.post('/assignRole', authController.assignRole);
module.exports = router;
