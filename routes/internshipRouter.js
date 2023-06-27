const express = require('express');
const router = express.Router();
const internship = require('../controllers/internshipController');
const authController = require('../controllers/authController')

router.use(authController.protect);
router.post('/register',authController.restrictTo('student'), internship.registerInternship);
router.get('/:id',authController.restrictTo('student'), internship.viewInternship);
router.put('/:id',authController.restrictTo('student'), internship.updateInternship);
router.delete('/:id', internship.deleteInternship);
router.use(authController.restrictTo('mentor', 'hod', 'tap-cell', 'principal'));
router.post('/approval/:id', internship.approveInternship);
router.post('/send-back/:id', internship.sendBack);
router.post('/reject/:id', internship.reject);
router.get('/all', internship.viewInternships);

module.exports = router;