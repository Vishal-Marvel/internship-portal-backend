const Student = require('../models/studentModel');
const Skill = require('../models/skillModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const knex = require('knex');

exports.updateStudent = catchAsync(async (req, res) => {
    try {
      let studentId;
      // console.log(req.user)
      if (req.user.roles.includes("student")){
        studentId = req.user.id;
      }
      else{
        studentId = req.body.student_id; // If the student Details is changed by a staff.
      }
        const {
          name,
          sec_sit,
          year_of_studying,
          phone_no,
          total_days_internship,
          placement_status,
          placed_company,
          skills
      } = req.body;
      const updatedData = {
        name, sec_sit, year_of_studying, phone_no,total_days_internship,
        placement_status,
        placed_company
      }
    
        // Find the student in the database based on the provided ID
        const student = await Student.findByIdAndUpdate(studentId, updatedData, {
          new: true, // Return the updated document
          runValidators: true, // Run the validation on the updated fields
          tableName: 'students' // Specify the table name
        });

        if (!student) {
          // If the student with the provided ID is not found, return an error response
          const err= new AppError("Student not found", 404);
          err.sendResponse(res);
          return;
        }

        // Get the existing skills for the student
        const existingSkills = await student.related('skills').pluck('skill_name');

        // Find skill_ids to be deleted and skill_ids to be added
        const skillsToDelete = existingSkills.filter((skill_id) => !skills.includes(skill_id));
        const skillsToAdd = skills.filter((skill_id) => !existingSkills.includes(skill_id));

        // Delete the skills that need to be removed
        await Promise.all(skillsToDelete.map((skill_id) => {
          return student.skills().detach(skill_id);
        }));

        // Add the new skills for the student
        await Promise.all(skillsToAdd.map((skill_id) => {
          return student.skills().attach(skill_id);
        }));

    // Fetch the updated student with related skills
        const updatedStudentWithSkills = await Student.forge({ id: studentId }).fetch({ withRelated: 'skills' });

        res.status(200).json({
          status: 'success',
          message: 'Student details and skills updated successfully',
          data: {
            student: updatedStudentWithSkills.toJSON(),
          },
        });
  } catch (error) {
    const err= new AppError("Error updating student details and skills", 500);
      err.sendResponse(res);
      return;
  }
});

exports.deleteStudent = catchAsync(async (req, res) => {
  try {
    const studentId = req.user.id;

    // Find the student in the database based on the provided ID
    await Student.findByIdAndDelete(studentId, {tableName: 'students'});


    // Send a success response
    res.status(200).json({
      status: 'success',
      message: 'Student details deleted successfully',
      
    });
  } catch (err) {
    // Handle any errors that occur during the process
    const error = new AppError(err.message, 400);
    error.sendResponse(res);
  }
});

exports.viewStudent = catchAsync(async (req, res) => {
  try {
    const loggedInUserId = req.user.id; 
    const loggedInUserRole = req.user.roles;
    const isHOD = loggedInUserRole.includes('hod');
    const isPrincipal = loggedInUserRole.includes('principal');
    const isInternshipCoordinator = loggedInUserRole.includes('internshipcoordinator');
    const isStudent = loggedInUserRole.includes('student');
    const isMentor = loggedInUserRole.includes('mentor');
    const isCeo = loggedInUserRole.includes('ceo');
    let studentId;
    
    if(isStudent){
      studentId = loggedInUserId;
    }
    else{
      studentId = req.params.id; // ID of the student to view
    }
    // Fetch the student from the database based on the studentId
    const student = await Student.where({ id: studentId }).fetch({ withRelated: 'skills' });

    if (!student) {
      const err= new AppError("No Student found in the database", 404);
      err.sendResponse(res);
      return;
    }

    if (isStudent || isHOD || isPrincipal|| isInternshipCoordinator|| isMentor||isCeo) {
      // Return the student details
      return res.status(200).json({
        status: 'success',
        data: {
          student,
        },
      });
    } else {
      const err= new AppError("Unauthorised access", 403);
      err.sendResponse(res);
    }
  } 
  catch (err) {
    // Handle any errors that occur during the process
    const err1= new AppError("Failed to fetch student details", 500);
      err1.sendResponse(res);
  }
  
});

exports.viewStudentInternship = catchAsync(async (req, res) => {

});


