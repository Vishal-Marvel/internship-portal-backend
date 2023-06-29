const InternshipDetails = require("../models/internshipModel")
const Approval = require("../models/approvalModel")
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.registerInternship = catchAsync(async (req, res) => {
    try {
        if (req.user.role === "student"){

        }

        // Retrieve the submitted data from the request body
        const {
            company_name,
            company_address,
            company_ph_no,
            current_cgpa,
            sin_tin_gst_no,
            industry_supervisor_name,
            industry_supervisor_ph_no,
            mode_of_intern,
            starting_date,
            ending_date,
            days_of_internship,
            location,
            domain,
            offer_letter
        } = req.body;
        const student_id = req.user.id;

        // Create a new instance of the InternshipDetails model
        const internshipDetails = new InternshipDetails({
            company_name,
            company_address,
            company_ph_no,
            current_cgpa,
            sin_tin_gst_no,
            industry_supervisor_name,
            industry_supervisor_ph_no,
            mode_of_intern,
            starting_date,
            ending_date,
            days_of_internship,
            location,
            domain,
            offer_letter,
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
        if (req.user.role === "mentor") {
            approval.set({ mentor: true });
            await approval.save();
            res.status(200).json({
                status: "success",
                message: "Mentor - approved",
            });
        } else if (req.user.role === "internship_coordinator" && approval.get("mentor")) {
            approval.set({ internship_coordinator: true });
            await approval.save();
            res.status(200).json({
                status: "success",
                message: "Internship Coordinator - approved",
            });
        } else if (req.user.role === "hod" && approval.get("mentor") && approval.get("internship_coordinator")) {
            approval.set({ hod: true });
            await approval.save();
            res.status(200).json({
                status: "success",
                message: "HOD - approved",
            });
        } else if (req.user.role === "tap-cell" && approval.get("mentor") && approval.get("internship_coordinator") && approval.get("hod")) {
            approval.set({ tap_cell: true });
            await approval.save();
            res.status(200).json({
                status: "success",
                message: "Tap-Cell - approved",
            });
        } else if (req.user.role === "principal" && approval.get("mentor") && approval.get("internship_coordinator") && approval.get("hod") && approval.get("tap_cell")) {
            approval.set({ principal: true });
            await approval.save();
            res.status(200).json({
                status: "success",
                message: "Principal - approved",
            });
        } else {
            res.status(406).json({
                status: "fail",
                message: "You cant approve the internship right now",
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

exports.getApprovalStatus = catchAsync(async (req, res)=>{
    try {
        const approval = await Approval.where({internship_id: req.params.id}).fetch();
        const approval_status = {
            mentor: approval.get('mentor'),
            internship_coordinator: approval.get('internship_coordinator'),
            hod: approval.get('hod'),
            tap_cell: approval.get('tap_cell'),
            principal: approval.get('principal'),
            comments: approval.get('comments'),

        }
        res.status(200).json({
            status: 'success',
            data: {
                approval_status
            }
        });
    }
    catch (e){
        const error = new AppError(e.message, 400);
        error.sendResponse(res);
    }
})

exports.reject = catchAsync(async (req,res)=>{

});
