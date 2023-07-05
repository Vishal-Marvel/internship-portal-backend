const Student = require('../models/studentModel');
const Staff = require('../models/staffModel')
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const jwt = require("jsonwebtoken");


// Signup function
exports.studentSignUp = catchAsync(async (req, res) => {

    try {
        const staff = await Staff.where({email:req.body.mentor_email}).fetch();
        req.body.staff_id = staff.id;
        req.body.role = "student";
        const {
            name,
            sec_sit,
            student_id,
            year_of_studying,
            register_num,
            department,
            email,
            phone_no,
            password,
            staff_id
        } = req.body;
        const student = new Student({
            name,
            sec_sit,
            student_id,
            year_of_studying,
            register_num,
            department,
            email,
            phone_no,
            password,
            staff_id
        })
        await student.save();
        res.status(201).json({
            status: 'success',
            data: {
                student
            }
        });
    } catch (err) {
        if (err.message === "EmptyResponse"){
            const error = new AppError("Staff Not Found", 404);
            error.sendResponse(res);
        }
        else {
            const error = new AppError(err.message, 400);
            error.sendResponse(res);
        }
    }
})

exports.staffSignup = catchAsync(async (req, res) => {

    try {
        const {
            name,
            department,
            email,
            sec_sit,
            phone_no,
            role,
            password
        } = req.body;
        const staff = new Staff({
            name,
            department,
            email,
            sec_sit,
            phone_no,
            role,
            password
        });
        await staff.save()

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
})

exports.studentLogin = catchAsync(async (req,res, next)=>{
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new AppError('Please provide both email and password', 400));
    }
    try {
        const student = await Student.where({email}).fetch();

        if (!(await student.verifyPassword(password))) {
            res.status(400).json({
                status: 'fail',
                message: 'Incorrect Username or Password'
            });
            return;
        }

        const token = jwt.sign({id: student.get('id'), role: "student"}, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRESIN
        });

        const cookieOptions = {
            expires: new Date(Date.now() + (process.env.COOKIE_EXPIRESIN * 60 * 60 * 1000)),
            httpOnly: true
        };

        res.cookie('jwt', token, cookieOptions);

        const role = "student";
        res.status(200).json({
            status: 'success',
            data: {
                token,
                role
            }
        });
    } catch (err) {
        if (err.message === "EmptyResponse") {
            const error = new AppError("Student Not Found", 404);
            error.sendResponse(res);
        }
        // throw err;
        else{
            const error = new AppError(err.message, 400);
            error.sendResponse(res);
        }
    }
})

exports.staffLogin = catchAsync(async (req,res, next)=>{
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new AppError('Please provide both email and password', 400));
    }
    try {
        const staff = await Staff.where({email}).fetch();

        if (!(await staff.verifyPassword(password))) {
            res.status(400).json({
                status: 'fail',
                message: 'Incorrect Username or Password'
            });
            return;
        }

        const token = jwt.sign({id: staff.get('id'), role: staff.get('role')}, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRESIN
        });

        const cookieOptions = {
            expires: new Date(Date.now() + process.env.COOKIE_EXPIRESIN * 60 * 60 * 1000),
            httpOnly: true
        };
        const role = staff.get('role');

        res.cookie('jwt', token, cookieOptions);

        res.status(200).json({
            status: 'success',
            data: {
                token,
                role
            }
        });
    } catch (err) {
        if (err.message === "EmptyResponse") {
            const error = new AppError("Staff Not Found", 404);
            error.sendResponse(res);
        }
        throw err;
    }
})

exports.protect = catchAsync(async (req, res, next) => {
    let token;
    // Get token
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }

    // Token not present
    if (!token) {
        const err = new AppError('Log In First', 401);
        err.sendResponse(res);
        return;
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const role = decoded.role;
    // console.log(decoded);
    let user = null;
    // Check if user exists
    if (role === "student")
        user = await Student.where({ id: decoded.id }).fetch();
    else {
        user = await Staff.where({id: decoded.id}).fetch();
    }

    if (!user) {
        const err = new AppError('User does not exist', 401);
        err.sendResponse(res);
        return;
    }
    const responseUser = {
        name: user.get('name'),
        role: role,
        id: user.get('id'),
        department : user.get('department'),
        sec_sit: user.get('sec_sit')
    }
    // Set student on req
    req.user = responseUser;
    res.locals.user = responseUser;

    next();
});

exports.restrictTo = (...roles) => {
    
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            console.log(req.user);
            return next(new AppError('You are not authorized to perform this action', 403));
        }

        next();
    };
};