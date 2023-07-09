const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.use(authController.protect);
router.use(authController.restrictTo("admin"));
router.post('/addRole', authController.addRole);
router.post('/removeRole', authController.removeRole);

module.exports = router;
