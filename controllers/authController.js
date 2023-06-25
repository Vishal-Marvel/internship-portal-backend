const Student = require('../models/studentModel');
const Staff = require('../models/staffModel')
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');


// Signup function
exports.studentSignUp = catchAsync(async (req, res) => {

    try {
        const email = req.body.mentor_email;
        const staff = await Staff.where({email:email}).fetch();
        req.body.staff_id = staff.id;
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

exports.staffSignup = catchAsync(async (req, res) => {

    try {
        const staff = await Staff.forge(req.body).save();

        res.status(201).json({
            status: 'success',
            data:{
                staff
            }
        });
    } catch (err) {
        const error = new AppError(err.message, 400);
        error.sendResponse(res);
    }
});

exports.studentLogin = catchAsync(async (req,res)=>{
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new AppError('Please provide both email and password', 400));
    }

    const student = await Student.where({ email }).fetch();

    if (!student || !(await student.verifyPassword(password))) {
        res.status(400).json({
            status: 'fail',
            message: 'Incorrect Username or Password'
        });
        return;
    }

    const token = jwt.sign({ id: student.get('id') }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRESIN
    });

    const cookieOptions = {
        expires: new Date(Date.now() + process.env.COOKIE_EXPIRESIN * 24 * 60 * 60 * 1000),
        httpOnly: true
    };

    res.cookie('jwt', token, cookieOptions);

    res.status(200).json({
        status: 'success',
        data: {
            token,
            student
        }
    });
})

exports.staffLogin = catchAsync(async (req,res)=>{
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new AppError('Please provide both email and password', 400));
    }

    const student = await Staff.where({ email }).fetch();

    if (!student || !(await student.verifyPassword(password))) {
        res.status(400).json({
            status: 'fail',
            message: 'Incorrect Username or Password'
        });
        return;
    }

    const token = jwt.sign({ id: student.get('id') }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRESIN
    });

    const cookieOptions = {
        expires: new Date(Date.now() + process.env.COOKIE_EXPIRESIN * 24 * 60 * 60 * 1000),
        httpOnly: true
    };

    res.cookie('jwt', token, cookieOptions);

    res.status(200).json({
        status: 'success',
        data: {
            token,
            student
        }
    });
});