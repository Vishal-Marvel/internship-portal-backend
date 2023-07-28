const Student = require('../models/studentModel');
const Staff = require('../models/staffModel')
const Role = require('../models/roleModel')
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const jwt = require("jsonwebtoken");

// Signup function
exports.studentSignUp = catchAsync(async (req, res) => {

    try {
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
            mentor_email
        } = req.body;

        if (
            !name ||
            !sec_sit ||
            !student_id ||
            !year_of_studying ||
            !register_num ||
            !department ||
            !email ||
            !phone_no ||
            !password ||
            !mentor_email
          ) {
            throw new AppError("All fields are required", 400);
          }

        const staff = await Staff.where({email:mentor_email}).fetch();
        const staff_id = staff.id;

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
        else if (err.code==="ER_DUP_ENTRY"){
            const error = new AppError("Student Already Exists", 400);
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
            password
        } = req.body;

        if (
            !name ||
            !email ||
            !phone_no ||
            !password
          ) {
            throw new AppError("All fields are required", 400);
          }

        const staff = new Staff({
            name,
            department,
            email,
            sec_sit,
            phone_no,
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
        if (err.code==="ER_DUP_ENTRY"){
            const error = new AppError("Staff Already Exists", 400);
            error.sendResponse(res);
        }
        else {
            const error = new AppError(err.message, 400);
            error.sendResponse(res);
        }
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
        const roles = ["student"];
        const token = jwt.sign({id: student.get('id'), roles: roles}, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRESIN
        });

        const cookieOptions = {
            expires: new Date(Date.now() + (process.env.COOKIE_EXPIRESIN * 60 * 60 * 1000)),
            httpOnly: true
        };

        res.cookie('jwt', token, cookieOptions);

        res.status(200).json({
            status: 'success',
            data: {
                token,
                roles
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
        const staff = await Staff.where({email}).fetch({ withRelated: ['roles'] });

        if (!(await staff.verifyPassword(password))) {
            res.status(400).json({
                status: 'fail',
                message: 'Incorrect Username or Password'
            });
            return;
        }
        const userRoles = staff.related('roles');
        const roles = userRoles.map(role=>role.get('role_name'))

        const token = jwt.sign({id: staff.get('id'), roles: roles}, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRESIN
        });

        const cookieOptions = {
            expires: new Date(Date.now() + process.env.COOKIE_EXPIRESIN * 60 * 60 * 1000),
            httpOnly: true
        };


        res.cookie('jwt', token, cookieOptions);

        res.status(200).json({
            status: 'success',
            data: {
                token,
                roles
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
    const roles = decoded.roles;
    // console.log(roles);
    let user = null;
    // Check if user exists
    if (roles.includes("student"))
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
        roles: roles,
        id: user.get('id'),
        department : user.get('department'),
        sec_sit: user.get('sec_sit')
    }
    // Set student on req
    req.user = responseUser;
    res.locals.user = responseUser;

    next();
});

exports.addRole = catchAsync(async (req, res)=>{
    try{
        const role_name=req.body.role_name
        const role = new Role({
            role_name
        })
        await role.save();
        res.status(200).json({
            status: "success",
            message: "Role Added"
        })
    }catch(e){
        if (e.code==="ER_DUP_ENTRY") {
            const error = new AppError("Role already Exists", 400);
            error.sendResponse(res);
        }
        else{
            const error = new AppError(e.message, 500);
            error.sendResponse(res);
        }
    }
})

exports.removeRole = catchAsync(async (req, res)=>{
    try{
        const role_name=req.body.role_name
        const role = await Role.where({role_name}).fetch();
        await role.destroy()
        res.status(200).json({
            status: "success",
            message: "Role Removed"
        })
    }catch(e){
        if (e.message==="EmptyResponse") {
            const error = new AppError("Role does not Exists", 400);
            error.sendResponse(res);
        }
        else{
            const error = new AppError(e.message, 500);
            error.sendResponse(res);
        }
    }
})

const validateRoleAssignment = (role, data) => {
    const rolesWithDepartment = ['mentor', 'internship_coordinator','hod' /* Add other roles that require department */];
    const rolesWithSecSit = ['mentor','internship_coordinator','hod','principal' /* Add other roles that require sec_sit */];

    if (rolesWithDepartment.includes(role)) {
        if (!data.department) {
            throw new Error('Department is required for this role');
        }
    }

    if (rolesWithSecSit.includes(role)) {
        if (!data.sec_sit) {
            throw new Error('Sec_sit is required for this role');
        }
    }
};

exports.assignRoles = catchAsync(async (req, res) => {
    try {
        const roles = req.body.roles;
        const staff = await Staff.where({ id: req.body.id }).fetch();
        const staffData = staff.toJSON();

        const roleObjs = await Promise.all(roles.map(async role => await Role.where({ role_name: role }).fetch()));
        const rolename = roleObjs.map(role => role.get('role_name'));
        // Assign roles only if staff provides the required information
        rolename.forEach((role) => {
            validateRoleAssignment(role, staffData);
        });

        // Role assignment logic here

        const roleIds = roleObjs.map(role => role.get('id')); // Extract the role IDs
        await staff.roles().attach(roleIds);

        res.status(200).json({
            status: 'success',
            message: `${roles.join(', ')} Assigned to ${staffData.name}`,
        });
    } catch (err) {
        const error = new AppError(err.message, 400);
        error.sendResponse(res);
    }
});


exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        const userRoles = req.user.roles;

        if (userRoles.some(role => roles.includes(role))) {
            return next();
        }

        return next(new AppError('You are not authorized to perform this action', 403));
    };
};

exports.doNotAllow = (...roles) => {
    return (req, res, next) => {
        const userRoles = req.user.roles;
        // const hasMatchingRole = roles.some(role => userRoles.includes(role));

        if (!userRoles.some(role => !roles.includes(role))) {
            return next(new AppError('You are not authorized to perform this action', 403));
        }


        next();
    };
};

