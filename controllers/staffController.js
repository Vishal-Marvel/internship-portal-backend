const Student = require('../models/studentModel');
const Staff = require('../models/staffModel')
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.viewStudents = catchAsync(async (req, res) => {
    try {
        const students = await Student.where({ staff_id: req.params.id }).fetchAll();
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
});
