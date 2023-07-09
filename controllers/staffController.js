const Student = require('../models/studentModel');
const Staff = require('../models/staffModel')
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.viewStudents = catchAsync(async (req, res) => {
    try {
        const students = await Student.where({ staff_id: req.user.id }).fetchAll();
        const studentNames = students.map(student => student.get('name'));

        res.status(200).json({
            data: {
                students: studentNames
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
    console.log("hello");
    try {
        const staffId = req.user.id;
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
