const Student = require('../models/studentModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');


// Signup function
exports.signUp = catchAsync(async (req, res) => {
  const student_id = req.body.student_id;
  const testStudent = await Student.where({ student_id }).fetch().catch(function (err){ });
  if (testStudent){
    const error =  new AppError('Student Already Exists', 400);
    error.sendResponse(res);
  }
  else {

    const student = await Student.forge(req.body).save();

    res.status(201).json({
      status: 'success',
      data: {
        student
      }
    });
  }
});
