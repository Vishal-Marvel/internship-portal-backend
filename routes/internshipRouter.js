const express = require('express');
const router = express.Router();
const internship = require('../controllers/internshipController');
const authController = require('../controllers/authController')
const multer = require('multer');
// Create an instance of multer for handling file uploads
const upload = multer({
    limits: {
        fileSize: 1048576 // 1 mb
    }
});

router.use(authController.protect);
router.use(authController.restrictTo('student', 'mentor','hod', 'tap-cell', 'internship_coordinator', 'principal', 'ceo'));
router.post('/register',upload.single('file'), internship.registerInternship);
router.post('/completion-update/:id',upload.fields([
    { name: 'certificate' },
    { name: 'attendance' },
    { name: 'feedback' },
]), internship.uploadCompletionForm);
router.route('/:id')
    .get(internship.viewInternship)
    .put(internship.updateInternship)
    .delete(internship.deleteInternship)
router.get('/approval-status/:id', internship.getApprovalStatus);
router.get('/download-report/:id', internship.downloadReport);
router.get('/download-file/:id', internship.downloadFiles);

router.use(authController.doNotAllow('student'));
router.post('/approval/:id', internship.approveInternship);
router.post('/send-back/:id', internship.sendBack);
router.post('/reject/:id', internship.reject);
router.get('/all', internship.viewInternships);
module.exports = router;