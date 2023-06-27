const InternshipDetails = require("../models/internshipModel")
const Approval = require("../models/approvalModel")
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
            offer_letter,
            domain,
            certificate_of_completion
        } = req.body;
        const student_id = req.user.id;

        // Create a new instance of the InternshipDetails model
        const internshipDetails = new InternshipDetails({
            company_name,
            sin_tin_gst_no,
            mode_of_intern,
            starting_date,
            ending_date,
            days_of_internship,
            location,
            offer_letter,
            domain,
            certificate_of_completion,
            student_id
        });

        // Save the internship details to the database
        await internshipDetails.save();
        const id = internshipDetails.get('id');
        const approval = new Approval({
            internship_id:id
        });
        await approval.save();

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
        // const error = new AppError(err.message, 400);
        // error.sendResponse(res);
        throw err;
    }
});

exports.viewInternship = catchAsync(async (req,res)=>{

});

exports.viewInternships = catchAsync(async (req,res)=>{

});

exports.updateInternship = catchAsync(async (req,res)=>{
    try {
        const internshipId = req.params.id;
        const updatedData = req.body;
    
        // Find the internship in the database based on the provided ID
        const internship = await InternshipDetails.findByIdAndUpdate(internshipId, updatedData, {
            new: true, // Return the updated document
            runValidators: true, // Run the validation on the updated fields
            tableName: 'internships' // Specify the table name
          });
    
        if (!internship) {
          // If the internship with the provided ID is not found, return an error response
          return res.status(404).json({
            status: 'fail',
            message: 'Internship not found',
          });
        }
        // Send a success response
        res.status(200).json({
          status: 'success',
          message: 'Internship details updated successfully',
          data: {
            internship,
          },
        });
      } catch (err) {
        // Handle any errors that occur during the process
        const error = new AppError(err.message, 400);
        error.sendResponse(res);
      }
});

exports.deleteInternship = catchAsync(async (req,res)=>{
    try {
        const internshipId = req.params.id;

        // Find the internship in the database based on the provided ID
        await InternshipDetails.findByIdAndDelete(internshipId, {tableName: 'internships'});

    
        // Send a success response
        res.status(200).json({
          status: 'success',
          message: 'Internship deleted successfully',
          
        });
      } catch (err) {
        // Handle any errors that occur during the process
        const error = new AppError(err.message, 400);
        error.sendResponse(res);
      }
});

exports.approveInternship = catchAsync(async (req,res)=>{
    try {
        // const internship = await InternshipDetails.where({id: req.params.id}).fetch();
        const approval = await Approval.where({internship_id: req.params.id}).fetch();
        console.log(approval);
        if (req.user.role === "mentor"){
            approval.save({mentor:true});
            res.status(200).json({
                status: 'success',
                message: 'Mentor - Internship approved'
            });
        }
        if (req.user.role === "hod"){
            approval.save({hod:true});
            res.status(200).json({
                status: 'success',
                message: 'HOD - Internship approved'
            });
        }
        if (req.user.role === "tap-cell"){
            approval.save({tap_cell:true});
            res.status(200).json({
                status: 'success',
                message: 'Tap-Cell - Internship approved'
            });
        }
        if (req.user.role === "principal"){
            approval.save({principal:true});
            res.status(200).json({
                status: 'success',
                message: 'Principal - Internship approved'
            });
        }
    }
    catch (err){
        // Handle any errors that occur during the process
        const error = new AppError(err.message, 400);
        error.sendResponse(res);

    }

});

exports.sendBack = catchAsync(async (req,res)=>{
    try {
        // const internship = await InternshipDetails.where({id: req.params.id}).fetch();
        const approval = await Approval.where({internship_id: req.params.id}).fetch();
        const comments = req.body.comments;
        await approval.save({comments})
        res.status(200).json({
            status: 'success',
            message: 'Comment Added and Sent Back'
        });


    }
    catch (err){
        // Handle any errors that occur during the process
        const error = new AppError(err.message, 400);
        error.sendResponse(res);

    }
});

exports.reject = catchAsync(async (req,res)=>{

});
