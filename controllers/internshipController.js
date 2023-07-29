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
const Role = require("../models/roleModel");
const moment = require('moment');

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
const saveFile = async (buffer, mimetype, fileName, originalname) => {
    try {
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
            location,
            domain,
            student_id // This is for internships registering by Staffs
        } = req.body;
        const approval_status = "Not Approved";

        if(!company_name||
           !company_address||
            !company_ph_no||
            !current_cgpa||
            !sin_tin_gst_no||
            !academic_year||
            !industry_supervisor_name||
            !industry_supervisor_ph_no||
            !mode_of_intern||
            !starting_date||
            !ending_date||
            !location||
            !domain){
             throw new AppError("All fields are required", 400);
        }

        const startDate = moment(starting_date);
        const endDate = moment(ending_date);
        const days_of_internship = endDate.diff(startDate, 'days') + 1;

        //special case
        if (req.user.roles.includes("student")){
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
        else{
            if(!student_id) throw new AppError("All fields are required", 400);
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
            approval_status
        });
        const student = await Student.where({id: student_id}).fetch();
        const { buffer, mimetype, originalname } = req.file;
        const fileName = `${student.get('student_id')}_${company_name}_${new Date()}_offer_letter`; // Append the unique suffix to the file name

        const offer_letter = await saveFile(buffer, mimetype, fileName, originalname);

        // Save the internship details to the database
        await internshipDetails.save();
        const id = internshipDetails.get('id');


        await internshipDetails.set({
            offer_letter
        })
        const approval = new Approval({
            internship_id:id
        });
        await approval.save();
        await internshipDetails.save();

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
        const internship = await InternshipDetails.where({id: id}).fetch();
        const student = await Student.where({id: internship.get('student_id')}).fetch();

        const { certificate, attendance, feedback } = req.files;
        const { buffer: certificateBuffer, mimetype: certificateMimetype, originalname: certificate_Original } = certificate[0];
        const certificateFileName = `${student.get('student_id')}_${internship.get('company_name')}_${new Date()}_certificate_of_completion`;
        const certificateId = await saveFile(certificateBuffer, certificateMimetype, certificateFileName, certificate_Original);

        const { buffer: attendanceBuffer, mimetype: attendanceMimetype, originalname: attendance_Original } = attendance[0];
        const attendanceFileName = `${student.get('student_id')}_${internship.get('company_name')}_${new Date()}_attendance`;
        const attendanceId = await saveFile(attendanceBuffer, attendanceMimetype, attendanceFileName, attendance_Original);

        const { buffer: feedbackBuffer, mimetype: feedbackMimetype, originalname: feedback_Original } = feedback[0];
        const feedbackFileName = `${student.get('student_id')}_${internship.get('company_name')}_${new Date()}_feedback`;
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

exports.canUpdate = catchAsync(async (req,res)=>{
    try {
        const internship = await InternshipDetails.where({id: req.params.id}).fetch();
        const endingDate = internship.get('ending_date');
        endingDate.setDate(endingDate.getDate()+15);
        if (endingDate > new Date()){
            res.status(200).json({
                status: 'success',
                message: 'Internship details can be updated'
            });
        }else{
            res.status(200).json({
                status: 'fail',
                message: 'Internship details cant be updated'
            });
        }
    }
    catch (err){
        const error = new AppError(err.message, 400);
        error.sendResponse(res)
    }
});

exports.updateInternship = catchAsync(async (req,res)=>{
    try {
        const internshipId = req.params.id;
        const updatedData = req.body;
    
        // Find the internship in the database based on the provided ID
        let internship = await InternshipDetails.findByIdAndUpdate(internshipId, updatedData, {
            new: true, // Return the updated document
            runValidators: true, // Run the validation on the updated fields
            tableName: 'internships' // Specify the table name
          });
        const student = await Student.where({id: internship.get('student_id')}).fetch();

        const { certificate, attendance, feedback, offer_letter } = req.files;
        let offer_letterId, certificateId, attendanceId, feedbackId;
        offer_letterId = internship.get('offer_letter');
        certificateId = internship.get('certificate');
        attendanceId = internship.get('attendance');
        feedbackId = internship.get('feedback');
        if (offer_letter) {
            const {
                buffer: offer_letterBuffer,
                mimetype: offer_letterMimetype,
                originalname: offer_letterOriginal
            } = offer_letter[0];
            const offer_letterFileName = `${student.get('student_id')}_${internship.get('company_name')}_offer_letter`;
            offer_letterId = await saveFile(offer_letterBuffer, offer_letterMimetype, offer_letterFileName, offer_letterOriginal);
            const file = await File.where({id: internship.get('offer_letter')}).fetchAll();
            if (file.length ===1) {
                await file.models[0].destroy();
            }
        }
        if (certificate) {
            const {
                buffer: certificateBuffer,
                mimetype: certificateMimetype,
                originalname: certificate_Original
            } = certificate[0];
            const certificateFileName = `${student.get('student_id')}_${internship.get('company_name')}_certificate_of_completion`;
            certificateId = await saveFile(certificateBuffer, certificateMimetype, certificateFileName, certificate_Original);
            const file = await File.where({id: internship.get('certificate')}).fetchAll();
            if (file.length ===1) {
                await file.models[0].destroy();
            }
        }
        if (attendance) {
            const {
                buffer: attendanceBuffer,
                mimetype: attendanceMimetype,
                originalname: attendance_Original
            } = attendance[0];
            const attendanceFileName = `${student.get('student_id')}_${internship.get('company_name')}_attendance`;
            attendanceId = await saveFile(attendanceBuffer, attendanceMimetype, attendanceFileName, attendance_Original);
            const file = await File.where({id: internship.get('attendance')}).fetchAll();
            if (file.length ===1) {
                await file.models[0].destroy();
            }
        }
        if (feedback) {
            const {buffer: feedbackBuffer, mimetype: feedbackMimetype, originalname: feedback_Original} = feedback[0];
            const feedbackFileName = `${student.get('student_id')}_${internship.get('company_name')}_feedback`;
            feedbackId = await saveFile(feedbackBuffer, feedbackMimetype, feedbackFileName, feedback_Original);
            const file = await File.where({id: internship.get('feedback')}).fetchAll();
            if (file.length ===1) {
                await file.models[0].destroy();
            }
        }
        internship = await InternshipDetails.findByIdAndUpdate( req.params.id ,{
            certificate: certificateId,
            attendance: attendanceId,
            feedback: feedbackId,
            offer_letter: offer_letterId
        } );

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
        if (req.params.role === "mentor") {
            if (approval.get('mentor')===1){
                const error = new AppError("Mentor already Approved", 400);
                error.sendResponse(res);
                return;
            }
            approval.set({
                mentor: true,
                mentor_id:req.user.id,
                mentor_approved_at:new Date()
            });
            await approval.save();

            // const staffs = await Staff.where(
            //    { department: student.get('department'),
            //     sec_sit: student.get('sec_sit')
            // }).fetchAll({withRelated:'roles'});
            // const filteredStaffs = staffs.filter(staff => {
            //     const roles = staff.related('roles').pluck('role_name');
            //     return roles.includes('internshipcoordinator');
            //   });
            const staffs = await Staff.query((qb) => {
                qb.where({
                  department: student.get('department'),
                  sec_sit: student.get('sec_sit')
                }).innerJoin('staff_roles', 'staffs.id', 'staff_roles.staff_id')
                  .innerJoin('roles', 'staff_roles.role_id', 'roles.id')
                  .where('roles.role_name', 'internshipcoordinator');
              }).fetchAll();
            const staffEmails = staffs.map(staffMember => staffMember.get('email'));
            for (const email of staffEmails) {
                await sendEmail(email, "Internship Approval - " + student.get('name')
                    , "Internship Registered by:\n " + student.get('name') + "\n\n"
                    + "Approve To Proceed\n\n\n\nThis is a auto generated mail. Do Not Reply");

            }
            res.status(200).json({
                status: "success",
                message: "Mentor - approved",
            });
        }
        else if (req.params.role === "internshipcoordinator" && approval.get("mentor")) {
            if (approval.get('internshipcoordinator')===1){
                const error = new AppError("Internship Coordinator already Approved", 400);
                error.sendResponse(res);
                return;
            }
            approval.set({
                internshipcoordinator: true,
                internshipcoordinator_id:req.user.id,
                internshipcoordinator_approved_at:new Date()});
            await approval.save();
            const staffs = await Staff.query((qb) => {
                qb.where({
                  department: student.get('department'),
                  sec_sit: student.get('sec_sit')
                }).innerJoin('staff_roles', 'staffs.id', 'staff_roles.staff_id')
                  .innerJoin('roles', 'staff_roles.role_id', 'roles.id')
                  .where('roles.role_name', 'hod');
              }).fetchAll();
            const staffEmails = staffs.map(staffMember => staffMember.get('email'));
            for (const email of staffEmails) {
                await sendEmail(email, "Internship Approval - " + student.get('name')
                    , "Internship Registered by:\n " + student.get('name') + "\n\n"
                    + "Approve To Proceed\n\n\n\nThis is a auto generated mail. Do Not Reply");

            }
            res.status(200).json({
                status: "success",
                message: "Internship Coordinator - approved",
            });
        } 
        else if (req.params.role === "hod" && approval.get("mentor") && approval.get("internshipcoordinator")) {
            if (approval.get('hod')===1){
                const error = new AppError("HOD already Approved", 400);
                error.sendResponse(res);
                return;
            }
            approval.set({
                hod: true,
                hod_id:req.user.id,
                hod_approved_at:new Date()});
            await approval.save();

            const staffs = await Staff.query((qb) => {qb
                .innerJoin('staff_roles', 'staffs.id', 'staff_roles.staff_id')
                .innerJoin('roles', 'staff_roles.role_id', 'roles.id')
                .where('roles.role_name', 'tapcell');
            }).fetchAll();

            const staffEmails = staffs.map(staffMember => staffMember.get('email'));
            for (const email of staffEmails) {
                await sendEmail(email, "Internship Approval - " + student.get('name')
                    , "Internship Registered by:\n " + student.get('name') + "\n\n"
                    + "Approve To Proceed\n\n\n\nThis is a auto generated mail. Do Not Reply");

            }
            res.status(200).json({
                status: "success",
                message: "HOD - approved",
            });
        } else if (req.params.role === "tapcell" && approval.get("mentor") && approval.get("internshipcoordinator") && approval.get("hod")) {
            if (approval.get('tapcell')===1){
                const error = new AppError("tapcell already Approved", 400);
                error.sendResponse(res);
                return;
            }
            approval.set({
                tapcell: true,
                tapcell_id:req.user.id,
                tapcell_approved_at:new Date()});
            await approval.save();

            const staffs = await Staff.query((qb) => {
                qb.where({
                  sec_sit: student.get('sec_sit')
                }).innerJoin('staff_roles', 'staffs.id', 'staff_roles.staff_id')
                  .innerJoin('roles', 'staff_roles.role_id', 'roles.id')
                  .where('roles.role_name', 'principal');
              }).fetchAll();
            const staffEmails = staffs.map(staffMember => staffMember.get('email'));
            for (const email of staffEmails) {
                await sendEmail(email, "Internship Approval - " + student.get('name')
                    , "Internship Registered by:\n " + student.get('name') + "\n\n"
                    + "Approve To Proceed\n\n\n\nThis is a auto generated mail. Do Not Reply");

            }
            res.status(200).json({
                status: "success",
                message: "tapcell - approved",
            });
        } else if (req.params.role === "principal" && approval.get("mentor") && approval.get("internshipcoordinator") && approval.get("hod") && approval.get("tapcell")) {
            if (approval.get('principal')===1){
                const error = new AppError("Principal already Approved", 400);
                error.sendResponse(res);
                return;
            }
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
            internship.set({approval_status:"Approved"})
            await internship.save();
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
        const internship = await InternshipDetails.where({id: req.params.id}).fetch();
        const comments = req.body.comments;
        approval.set({
            comments: comments,
            comments_by_id: req.user.id,
            comments_by_Role: req.params.role,
            commented_at: new Date()
        })
        internship.set({approval_status:"Sent Back"})
        await internship.save();
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
            internshipcoordinator: approval.get('internshipcoordinator'),
            hod: approval.get('hod'),
            tap_cell: approval.get('tapcell'),
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
    try {
        // const internship = await InternshipDetails.where({id: req.params.id}).fetch();
        const approval = await Approval.where({internship_id: req.params.id}).fetch();
        const internship = await InternshipDetails.where({id: req.params.id}).fetch();
        const comments = req.body.comments;
        approval.set({
            comments: comments,
            comments_by_id: req.user.id,
            comments_by_Role: req.user.role,
            commented_at: new Date()
        })
        internship.set({approval_status:"Rejected"})
        await internship.save();
        await approval.save()
        res.status(200).json({
            status: 'success',
            message: 'Rejected'
        });


    }
    catch (err){
        // Handle any errors that occur during the process
        const error = new AppError(err.message, 400);
        error.sendResponse(res);

    }
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