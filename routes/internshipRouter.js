const express = require('express');
const router = express.Router();
const internship = require('../controllers/internshipController');
const authController = require('../controllers/authController')

router.use(authController.protect);
router.post('/register',authController.restrictTo('student'), internship.registerInternship);
router.use(authController.restrictTo('student', 'mentor', 'tap-cell', 'internship_coordinator', 'principal', 'ceo'));
router.route('/:id')
    .get(internship.viewInternship)
    .put(internship.updateInternship)
    .delete(internship.deleteInternship)
router.get('/approval-status/:id', internship.getApprovalStatus);

router.use(authController.restrictTo('mentor', 'tap-cell', 'internship_coordinator', 'principal', 'ceo'));
router.post('/approval/:id', internship.approveInternship);
router.post('/send-back/:id', internship.sendBack);
router.post('/reject/:id', internship.reject);
router.get('/all', internship.viewInternships);

module.exports = router;