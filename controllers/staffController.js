const Student = require('../models/studentModel');
const Staff = require('../models/staffModel')
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.viewMenteeStudents = catchAsync(async (req, res) => {
    try {
        const students = await Student.where({ staff_id: req.params.id }).fetchAll();
        const studentNames = students.map(student => student.get('name'));
        const studentIds = students.map(student => student.get('id'));
        const studentStudentIds = students.map(student => student.get('student_id'));

        res.status(200).json({
            data: {
                studentNames,
                studentIds,
                studentStudentIds
            }
        });
    } catch (error) {
        const err = new AppError(error.message, 400);
        err.sendResponse(res);
    }
});

exports.viewStaff = catchAsync(async (req, res) => {
});

exports.updateStaff = catchAsync(async (req, res) => {
    try {
        const staffId = req.params.id;
        const {
            name,
            phone_no
        } = req.body;

        const updatedData = {
          name,phone_no
        }
      
          // Find the staff in the database based on the provided ID
          const staff = await Staff.findByIdAndUpdate(staffId, updatedData, {
            new: true, // Return the updated document
            runValidators: true, // Run the validation on the updated fields
            tableName: 'staffs' // Specify the table name
          });
      
          if (!staff) {
            // If the staff with the provided ID is not found, return an error response
            return res.status(404).json({
              status: 'fail',
              message: 'Staff not found',
            });
          }
      
          // Send a success response
          res.status(200).json({
            status: 'success',
            message: 'Staff details updated successfully',
            data: {
              staff,
            },
          });
      }
      catch (err) {
          // Handle any errors that occur during the process
          const error = new AppError(err.message, 400);
          error.sendResponse(res);
      }
});

exports.deleteStaff = catchAsync(async (req, res) => {
});

exports.migrateMentees = catchAsync(async (req, res) => {
    try{
        const to_staff = req.body.to_staff;
        const students = req.body.students;
        for (const studentId of students){
            const student = await Student.where({ id: studentId }).fetch();
            student.set('staff_id', to_staff);
            await student.save();
        }
        res.status(200).json({
            status: "success",
            message: "Mentor changed"
        })

    }catch(e){
        const err = new AppError(e.message, 500);
        await err.sendResponse(res);
    }
})
