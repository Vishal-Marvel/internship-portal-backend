const Student = require('../models/studentModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');


// Signup function
exports.signUp = catchAsync(async (req, res) => {
    try {
        const student = await Student.forge(req.body).save();
        res.status(201).json({
            status: 'success',
            data: {
                student
            }
        });
    } catch (err) {
        const error = new AppError(err.message, 400);
        error.sendResponse(res);
    }
});

exports.login = catchAsync(async (req,res)=>{

})

