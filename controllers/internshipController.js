const InternshipDetails = require("../models/internshipModel")
const Approval = require("../models/approvalModel")
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const {sendEmail} = require("../utils/mail");
const Student = require("../models/studentModel");
const Staff = require("../models/staffModel");
const File = require("../models/fileModel");
const fs = require('fs');
const {generateInternshipDetails} = require("../utils/pdfGenerator");

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
const saveFile = async (buffer, mimetype, fileName, originalname) => {
    try {
        console.log(mimetype);
        if (mimetype !== 'application/pdf') {
            throw new AppError('File type is invalid', 400);
        }

        const file = new File({
            file_name: fileName,
            file: buffer
        });

        await file.save();

        return file.id;
    }
    catch (e){
        if (e.code === 'ER_DATA_TOO_LONG'){
           throw new AppError(`File ${originalname} is too large`,  400);
        }
        else{
            throw new AppError(e.message,  500);
        }
    }
};

exports.registerInternship = catchAsync(async (req, res) => {
    try {

        // Retrieve the submitted data from the request body
        let {
            company_name,
            company_address,
            company_ph_no,
            current_cgpa,
            sin_tin_gst_no,
            academic_year,
            industry_supervisor_name,
            industry_supervisor_ph_no,
            mode_of_intern,
            starting_date,
            ending_date,
            days_of_internship,
            location,
            domain,
            student_id // This is for students registering by Staffs
        } = req.body;
        //special case
        if (req.user.role === "student"){
            const student = await Student.where({id:req.user.id}).fetch();
            if (student.get('total_days_internship')+days_of_internship >45 && !student.get('placement_status') && student.get('placed_company')!==company_name){
                res.status(400).json({
                    status:"failed",
                    message:"Internship Days Exceeded"
                })
                return;
            }
            student_id = req.user.id;
        }

        // Create a new instance of the InternshipDetails model
        const internshipDetails = new InternshipDetails({
            company_name,
            company_address,
            company_ph_no,
            current_cgpa,
            sin_tin_gst_no,
            academic_year,
            industry_supervisor_name,
            industry_supervisor_ph_no,
            mode_of_intern,
            starting_date,
            ending_date,
            days_of_internship,
            location,
            domain,
            student_id,
        });

        // Save the internship details to the database
        await internshipDetails.save();
        const id = internshipDetails.get('id');

        const { buffer, mimetype, originalname } = req.file;
        const fileName = `${id}_offer_letter`; // Append the unique suffix to the file name

        const offer_letter = await saveFile(buffer, mimetype, fileName, originalname);
        await internshipDetails.set({
            offer_letter
        })
        const approval = new Approval({
            internship_id:id
        });
        await approval.save();
        const student = await Student.where({id: student_id}).fetch();
        const staff = await Staff.where({id: student.get('staff_id')}).fetch();

        await sendEmail(staff.get('email'), "Internship Approval - " + student.get('name')
            , "Internship Registered by:\n " + student.get('name') + "\n\n"
            + "Approve To Proceed\n\n\n\nThis is a auto generated mail. Do Not Reply");

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
        // throw err;
    }
});

exports.uploadCompletionForm = catchAsync(async (req, res)=>{

    try {
        const id = req.params.id;
        const { certificate, attendance, feedback } = req.files;
        const { buffer: certificateBuffer, mimetype: certificateMimetype, originalname: certificate_Original } = certificate[0];
        const certificateFileName = `${id}_certificate_of_completion`;
        const certificateId = await saveFile(certificateBuffer, certificateMimetype, certificateFileName, certificate_Original);

        const { buffer: attendanceBuffer, mimetype: attendanceMimetype, originalname: attendance_Original } = attendance[0];
        const attendanceFileName = `${id}_attendance`;
        const attendanceId = await saveFile(attendanceBuffer, attendanceMimetype, attendanceFileName, attendance_Original);

        const { buffer: feedbackBuffer, mimetype: feedbackMimetype, originalname: feedback_Original } = feedback[0];
        const feedbackFileName = `${id}_feedback`;
        const feedbackId = await saveFile(feedbackBuffer, feedbackMimetype, feedbackFileName, feedback_Original);

        await InternshipDetails.findByIdAndUpdate( req.params.id ,{
            certificate: certificateId,
            attendance: attendanceId,
            feedback: feedbackId
        } );

        res.status(201).json({
            status: 'success',
            message: 'Internship documents uploaded successfully',

        });
    }
    catch (err){
        const error = new AppError(err.message, 400);
        error.sendResponse(res);

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
        const internship = await InternshipDetails.where({id: req.params.id}).fetch();
        const student = await Student.where({id: internship.get('student_id')}).fetch();
        const approval = await Approval.where({internship_id: req.params.id}).fetch();
        if (req.user.role === "mentor") {
            approval.set({
                mentor: true,
                mentor_id:req.user.id,
                mentor_approved_at:new Date()
            });
            await approval.save();
            const staff = await Staff.where({
                role: 'internship_coordinator',
                department: student.get('department'),
                sec_sit: student.get('sec_sit')
            }).fetchAll();
            const staffEmails = staff.map(staffMember => staffMember.get('email'));
            for (const email of staffEmails) {
                await sendEmail(email, "Internship Approval - " + student.get('name')
                    , "Internship Registered by:\n " + student.get('name') + "\n\n"
                    + "Approve To Proceed\n\n\n\nThis is a auto generated mail. Do Not Reply");

            }
            res.status(200).json({
                status: "success",
                message: "Mentor - approved",
            });
        } else if (req.user.role === "internship_coordinator" && approval.get("mentor")) {
            approval.set({
                internship_coordinator: true,
                internship_coordinator_id:req.user.id,
                internship_coordinator_approved_at:new Date()});
            await approval.save();
            const staff = await Staff.where({
                role: 'hod',
                department: student.get('department'),
                sec_sit: student.get('sec_sit')
            }).fetch();
            await sendEmail(staff.get("email"), "Internship Approval - " + student.get('name')
                , "Internship Registered by:\n " + student.get('name') + "\n\n"
                + "Approve To Proceed\n\n\n\nThis is a auto generated mail. Do Not Reply");
            res.status(200).json({
                status: "success",
                message: "Internship Coordinator - approved",
            });
        } else if (req.user.role === "hod" && approval.get("mentor") && approval.get("internship_coordinator")) {
            approval.set({
                hod: true,
                hod_id:req.user.id,
                hod_approved_at:new Date()});
            await approval.save();
            const staff = await Staff.where({role: 'tap-cell'}).fetch();
            await sendEmail(staff.get("email"), "Internship Approval - " + student.get('name')
                , "Internship Registered by:\n " + student.get('name') + "\n\n"
                + "Approve To Proceed\n\n\n\nThis is a auto generated mail. Do Not Reply");
            res.status(200).json({
                status: "success",
                message: "HOD - approved",
            });
        } else if (req.user.role === "tap-cell" && approval.get("mentor") && approval.get("internship_coordinator") && approval.get("hod")) {
            approval.set({
                tap_cell: true,
                tap_cell_id:req.user.id,
                tap_cell_approved_at:new Date()});
            await approval.save();
            const staff = await Staff.where({role: 'principal', sec_sit: student.get('sec_sit')}).fetch();
            await sendEmail(staff.get("email"), "Internship Approval - " + student.get('name')
                , "Internship Registered by:\n " + student.get('name') + "\n\n"
                + "Approve To Proceed\n\n\n\nThis is a auto generated mail. Do Not Reply");
            res.status(200).json({
                status: "success",
                message: "Tap-Cell - approved",
            });
        } else if (req.user.role === "principal" && approval.get("mentor") && approval.get("internship_coordinator") && approval.get("hod") && approval.get("tap_cell")) {
            approval.set({
                principal: true,
                principal_id:req.user.id,
                principal_approved_at:new Date()});
            await approval.save();
            await sendEmail(student.get("email"), "Internship Approved - " + student.get('name'),
                student.get('name') + " Congratulations!! Your internship is approved successfully\n\n\n\nThis is a auto generated mail. Do Not Reply");
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
        // const internship = await InternshipDetails.where({id:req.params.id}).fetch();
        // const student = await Student.where({id:internship.get('student_id')}).fetch();
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
        approval.set({
            comments: comments,
            comments_by_id: req.user.id,
            comments_by_Role: req.user.role,
            commented_at: new Date()
        })
        await approval.save()
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

exports.downloadReport = catchAsync(async (req, res) =>{
    try{
        const internship = await InternshipDetails.where({id: req.params.id}).fetch();
        const approval = await Approval.where({internship_id: req.params.id}).fetch();
        const student = await Student.where({id:internship.get('student_id')}).fetch();
        const path = await generateInternshipDetails(internship, student, approval);
        await sleep(1000);
        const pdfBuffer = fs.readFileSync(path);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="document.pdf"');
        res.send(pdfBuffer);
    }
    catch(e){
        const err = new AppError(e.message, 404);
        err.sendResponse(res);
    }
})

exports.downloadFiles = catchAsync(async (req, res) =>{
    try {
        const fileId = req.params.id;
        const file = await File.where({ id: fileId }).fetch();

        if (!file) {
            return res.status(404).json({
                status: 'error',
                message: 'File not found',
            });
        }

        const fileName = file.get('file_name');
        const fileData = file.get('file');

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.send(fileData);
    } catch (err) {
        const e = new AppError(err.message, 500);
        e.sendResponse(res);
    }

})