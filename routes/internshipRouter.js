const express = require('express');
const router = express.Router();
const internship = require('../controllers/internshipController');

router.post('/register', internship.registerInternship);
router.get('/:id', internship.viewInternship);
router.put('/:id', internship.updateInternship);
router.delete('/:id', internship.deleteInternship);
router.post('/approval/:id', internship.approveInternship);
router.post('/send-back/:id', internship.approveInternship);
router.post('/reject/:id', internship.approveInternship);
router.get('/all', internship.viewInternships);

module.exports = router;