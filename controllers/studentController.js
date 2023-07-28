const Student = require('../models/studentModel');
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
          return res.status(404).json({
            status: 'fail',
            message: 'Student not found',
          });
        }
    
        // Send a success response
        res.status(200).json({
          status: 'success',
          message: 'Student details updated successfully',
          data: {
            student,
          },
        });
    }
    catch (err) {
        // Handle any errors that occur during the process
        const error = new AppError(err.message, 400);
        error.sendResponse(res);
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

});

exports.viewStudentInternship = catchAsync(async (req, res) => {

});


