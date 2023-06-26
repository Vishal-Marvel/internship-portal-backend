const InternshipDetails = require("../models/internshipModel")
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.registerInternship = catchAsync(async (req, res) => {
    try {
        // Retrieve the submitted data from the request body
        const {
            company_name,
            sin_tin_gst_no,
            mode_of_intern,
            starting_date,
            ending_date,
            days_of_internship,
            location,
            pdf_of_verified_OD_letter,
            domain,
            skills,
            certificate_of_completion
        } = req.body;

        // Create a new instance of the InternshipDetails model
        const internshipDetails = new InternshipDetails({
            company_name,
            sin_tin_gst_no,
            mode_of_intern,
            starting_date,
            ending_date,
            days_of_internship,
            location,
            pdf_of_verified_OD_letter,
            domain,
            skills,
            certificate_of_completion
        });

        // Save the internship details to the database
        await internshipDetails.save();

        // Send a success response
        res.status(201).json({
            status: 'success',
            message: 'Internship details registered successfully',
            data: {
                internshipDetails,
            },
        });
    } catch (err) {
        // Handle any errors that occur during the process
        const error = new AppError(err.message, 400);
        error.sendResponse(res);
    }
});

exports.viewInternship = catchAsync(async (req,res)=>{

});

exports.viewInternships = catchAsync(async (req,res)=>{

});

exports.updateInternship = catchAsync(async (req,res)=>{

});

exports.deleteInternship = catchAsync(async (req,res)=>{

});

exports.approveInternship = catchAsync(async (req,res)=>{

});

exports.sendBack = catchAsync(async (req,res)=>{

});

exports.reject = catchAsync(async (req,res)=>{

});
