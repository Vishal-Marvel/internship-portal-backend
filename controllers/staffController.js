const Student = require('../models/studentModel');
const Staff = require('../models/staffModel')
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Role = require("../models/roleModel");
const File = require("../models/fileModel");
const {savePhoto} = require("../utils/saveFiles");

function unpick(object, fieldsToUnpick) {
  const newObject = { ...object }; // Create a shallow copy of the object

  for (const field of fieldsToUnpick) {
      delete newObject[field];
  }

  return newObject;
}

const validateRoleAssignment = (role, data) => {
    const rolesWithDepartment = ['mentor', 'internship_coordinator','hod' ];
    const rolesWithSecSit = ['mentor','internship_coordinator','hod','principal' ];

    if (rolesWithDepartment.includes(role)) {
        if (!data.department) {
            throw new AppError(`For Staff ${data.name} with role ${role}, Department is required for this role`, 400);
        }
    }

    if (rolesWithSecSit.includes(role)) {
        if (!data.sec_sit) {
            throw new AppError(`For Staff ${data.name} with role ${role}, SEC / SIT is required for this role`, 400);
        }
    }
};

exports.viewMenteeStudents = catchAsync(async (req, res) => {
    try {
        let staff_id;
        if (req.user.roles.includes('mentor')){
            staff_id = req.user.id;
        }
        else if (req.params.id){
            staff_id = req.params.id;
        }
        else{
            const err = new AppError("Unauthorized Access", 401);
            err.sendResponse(res);
            return;
        }
        const students = await Student.where({ staff_id: staff_id }).fetchAll({ withRelated: 'skills' });
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

// Controller function to get all roles
exports.getAllRoles = catchAsync(async (req, res) => {
  const roles = await Role.fetchAll();
  const role_names = roles.map(role => role.get('role_name'));
  res.json({
    status: 'success',
    data: {
      role_names
    }
  });
});

exports.updateRole = catchAsync(async (req, res) => {
    try {
        const roles = req.body.roles;
        const staff = await Staff.where({ id: req.body.id }).fetch({ withRelated: ['roles'] });

        const staffData = staff.toJSON();
        // Fetch the existing roles of the staff
        const existingRoles = staff.related('roles').pluck('role_name');
        const rolesToAdd = roles.filter(role => !existingRoles.includes(role));
        const rolesToRemove = existingRoles.filter(role => !roles.includes(role));

        const rolesToRemoveObj = await Promise.all(rolesToRemove.map(async role => await Role.where({ role_name: role }).fetch()));
        const rolesToRemoveIds = rolesToRemoveObj.map(role => role.get('id'));
        await staff.roles().detach(rolesToRemoveIds);

        const rolesToAddObj = await Promise.all(rolesToAdd.map(async role => await Role.where({ role_name: role }).fetch()));
        const rolesToAddIds = rolesToAddObj.map(role => role.get('id'));
        const rolesToAddNames = rolesToRemoveObj.map(role => role.get('role_name'));
        // Assign new roles only if staff provides the required information
        rolesToAddNames.forEach(role => {
            validateRoleAssignment(role, staffData);
        });
        // Attach the new role to the staff
        await staff.roles().attach(rolesToAddIds);

        res.status(200).json({
            status: 'success',
            message: `${roles.join(', ')} Assigned to ${staffData.name}`,
        });
    } catch (err) {
        if (err.message === "EmptyResponse"){
            const error = new AppError("Staff or Role Not Found", 404);
            error.sendResponse(res);
        }
        else {
            const error = new AppError(err.message, 500);
            error.sendResponse(res);
        }
    }
});

exports.viewRoles = catchAsync(async (req, res) => {
    const staff = await Staff.where({ id: req.params.id }).fetch({ withRelated: ['roles'] });

    // Fetch the existing roles of the staff
    const existingRoles = staff.related('roles').pluck('role_name');
    if (existingRoles.length ===0){
        return res.status(200).json({
            status: 'success' ,
            message: 'No Roles Found'
        })
    }
    else {
        return res.status(200).json({
            status: 'success' ,
            roles: existingRoles
        })
    }
});

exports.updateStaff = catchAsync(async (req, res) => {
    try {
        let staffId;
        if (req.params.id) {
            staffId = req.params.id;
        }else{
            staffId = req.user.id;
        }

        const {
            name,
            phone_no,
            email,
            department,
            sec_sit,
        } = req.body;
        let profile_photo;
        if (req.file) {
            // Create a new record in the "files" table to store the new photo
            const {buffer, mimetype, originalname} = req.file;
            const fileName = `${name}_profile_photo`; // Append the unique suffix to the file name

            // Delete the existing profile photo if it exists and not a default photo
            const existingStaff = await Staff.where({id: staffId}).fetch();
            const existingProfilePhotoId = existingStaff.get('profile_photo');

            // Retrieve the default profile photo ID from the files table
            const defaultProfilePhoto = await File.where({file_name: 'default_profile_photo'}).fetch();
            const defaultProfilePhotoId = defaultProfilePhoto.get('id');

            if (existingProfilePhotoId !== defaultProfilePhotoId && existingProfilePhotoId) {
                await File.where({id: existingProfilePhotoId}).destroy();

            }
            // Update the profile_photo field with the new photo ID
            profile_photo = await savePhoto(buffer, mimetype, fileName, originalname);
        }

        const updatedData = {
          name,phone_no,email,
            department,
            sec_sit,
            profile_photo
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
          // Update the file name based on the staff details
          // if (req.file && fileName) {
          //   fileName = `${staff.get('name')}_profile_photo`;
          //   await File.where({ id: profile_photo }).save({ file_name: fileName });
          // }
          // Send a success response
          res.status(200).json({
            status: 'success',
            message: 'Staff details updated successfully'
          });
      }
      catch (err) {
          if (err.message === "EmptyResponse"){
              const error = new AppError("Staff Not Found", 404);
              error.sendResponse(res);
          }
          else {
              const error = new AppError(err.message, 500);
              error.sendResponse(res);
          }
      }
});

exports.deleteStaff = catchAsync(async (req, res) => {
    try {
        const staffId = req.params.id;
        await Staff.findByIdAndDelete(staffId, {tableName: 'staffs'});
            res.status(200).json({
          status: 'success',
          message: 'Staff details deleted successfully',
          
        });
      } catch (err) {
        if (err.message === "EmptyResponse"){
            const error = new AppError("Staff Not Found", 404);
            error.sendResponse(res);
        }
        else {
            const error = new AppError(err.message, 500);
            error.sendResponse(res);
        }
      }
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

exports.viewStaff = catchAsync(async (req, res) => {
  try {
    const loggedInStaffId = req.user.id; // ID of the logged-in staff member
    const loggedInStaffRole = req.user.roles; // Role of the logged-in staff member
    const isHOD = loggedInStaffRole.includes('hod');
    const isPrincipal = loggedInStaffRole.includes('principal');
    
    let staffId;
    if(req.params.id){
    staffId = req.params.id; // ID of the staff to view
    }
    else{
      staffId = loggedInStaffId;
    }
    // Fetch the staff from the database based on the staffId
    const staff = await Staff.where({ id: staffId }).fetch();

    if (!staff) {
      const err= new AppError("Staff not found", 404);
      err.sendResponse(res);
      return;
    }

    let unPickFields = staff.toJSON();
    if(staff){
      unPickFields = unpick(unPickFields,['registered_date','password','OTP','OTP_validity']);
    }
    // If the logged-in staff is the same as the staff being viewed or is higher staff, allow access
    if (staffId === loggedInStaffId || isHOD || isPrincipal) {
      // Return the staff details
      return res.status(200).json({
        status: 'success',
        data: {
          staff:unPickFields,
        },
      });
    } else {
      throw new AppError("Unauthorised access to staff details", 403);

    }
  } catch (err) {
    // Handle any errors that occur during the process
    const err1= new AppError("Failed to fetch staff details", err.statusCode);
      err1.sendResponse(res);
  }
});

exports.viewMultipleStaff = catchAsync(async (req, res) => {
  
  try {
    const loggedInStaffRole = req.user.roles; // Role of the logged-in staff member
    const loggedInStaffSecSit = req.user.sec_sit; // SEC or SIT value for the logged-in staff
    const isHOD = loggedInStaffRole.includes('hod');
    const isPrincipal = loggedInStaffRole.includes('principal');
    const isCeo = loggedInStaffRole.includes('ceo');
    let staffs;
    if (isCeo) {
      // Fetch all staff from the database
      staffs = await Staff.fetchAll();

    } 
    else if (isHOD) {
      // Fetch all staffs in the same department as the HOD
      const department = req.user.department;
      staffs = await Staff.where({ department:department, sec_sit:loggedInStaffSecSit }).fetchAll();


    } else if (isPrincipal) {
      // Fetch all staffs in the same SEC or SIT as the Principal
      staffs = await Staff.where({ sec_sit: loggedInStaffSecSit }).fetchAll();


    } else {
      throw new AppError("Unauthorised access to view multiple staffs", 403);

    }
      const processedStaffs = staffs.map(async staff => {
          // Copy student attributes to a new object
          const processedStaff = { ...staff.attributes };

          // Exclude specific fields
          const excludedFields = ['registered_date', 'password','OTP','OTP_validity'];
          for (const field of excludedFields) {
              delete processedStaff[field];
          }

          return processedStaff;
      });

      // Wait for all student processing to complete
      const finalProcessedStaffs = await Promise.all(processedStaffs);

      // Return the staff details
      return res.status(200).json({
          status: 'success',
          data: {
              staffs:finalProcessedStaffs,
          },
      });
  }

  catch (err) {
    // Handle any errors that occur during the process
    const err1= new AppError(err.message, err.statusCode);
    err1.sendResponse(res);
  }
});

exports.viewMultipleStudent = catchAsync(async (req, res) => {

    try {
        const loggedInStaffRole = req.user.roles; // Role of the logged-in staff member
        const loggedInStaffSecSit = req.user.sec_sit; // SEC or SIT value for the logged-in staff
        const isCEOOrTapCell = loggedInStaffRole.includes('ceo') || loggedInStaffRole.includes('tapcell');
        const isPrincipal = loggedInStaffRole.includes('principal');
        const isHODOrCoordinator = loggedInStaffRole.includes('hod') || loggedInStaffRole.includes('internshipcoordinator');
        let students;
        if (isCEOOrTapCell) {
            // Fetch all students from the database
            students = await Student.fetchAll({withRelated: 'skills'});

        } else if (isPrincipal) {
            // Fetch all students from the same SEC or SIT as the Principal
            students = await Student.where({sec_sit: loggedInStaffSecSit}).fetchAll({withRelated: 'skills'});


        } else if (isHODOrCoordinator) {
            // Fetch all students from the same department as the HOD or Coordinator
            const department = req.user.department;
            students = await Student.where({
                department: department,
                sec_sit: loggedInStaffSecSit
            }).fetchAll({withRelated: 'skills'});

        } else {
            throw new AppError("Unauthorised access to view multiple students", 403);
        }
        if (!students || students.length === 0) {
            throw new AppError("No Student found in the database", 404);

        }

        const processedStudents = students.map(async student => {
            // Copy student attributes to a new object
            const processedStudent = {...student.attributes};

            // Exclude specific fields
            const excludedFields = ['registered_date', 'password', 'staff_id'];
            for (const field of excludedFields) {
                delete processedStudent[field];
            }

            // Fetch mentor details using staff_id from the student table
            const mentorId = student.get('staff_id');
            const mentor = await Staff.where({id: mentorId}).fetch();
            processedStudent.mentor_name = mentor.get('name');


            // Process skills
            processedStudent.skills = student.related('skills').map(skill => skill.get('skill_name'));

            return processedStudent;
        });

        // Wait for all student processing to complete
        const finalProcessedStudents = await Promise.all(processedStudents);

        // Return the student details
        return res.status(200).json({
            status: 'success',
            data: {
                students: finalProcessedStudents,
            },
        });
    } catch (err) {
        // Handle any errors that occur during the process
        const err1 = new AppError(err.message, err.statusCode);
        err1.sendResponse(res);
    }
});

exports.getDepartMentors = catchAsync(async (req, res)=>{
    try{
        const dept = req.params.dept;
        const staffs = await Staff.where({department: dept}).fetchAll({withRelated: ["roles"]});
        const staffNameEmail = {};
        for (const staff of staffs) {
            const roles = staff.related('roles').pluck('role_name');
            if (roles.includes('mentor')) {
                const name = staff.get('name');
                staffNameEmail[name] = staff.get('email');
            }
        }
        return res.status(200).json({
            status:  "success",
            data: staffNameEmail
        })

    }catch (e){
        const err = new AppError(e.message, 500);
        err.sendResponse(res);
    }
})
