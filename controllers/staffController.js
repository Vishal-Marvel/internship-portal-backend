const Student = require('../models/studentModel');
const Staff = require('../models/staffModel')
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.viewStudents = catchAsync(async (req,res)=>{
    // const staff = await Staff.where({ id: req.params.id }).fetch({ withRelated: 'students' });
    try {
        const students = await Student.where({staff_id: req.params.id}).fetchAll()
        res.status(200).json({
            data: {students}
        });
    }
    catch (error){
        const err = new AppError(error.message, 400);
        err.sendResponse(res);
    }
})
