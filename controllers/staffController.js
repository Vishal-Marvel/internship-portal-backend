const Student = require('../models/studentModel');
const Staff = require('../models/staffModel')
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.viewMenteeStudents = catchAsync(async (req, res) => {
    try {
        let staff_id;
        if (req.params.id){
            staff_id = req.params.id;
        }
        else if (req.user.roles.includes('mentor')){
            staff_id = req.params.id;
        }
        else{
            return res.status(403).json({
                status: 'fail',
                message: 'Unauthorized access',
            });
        }
        const students = await Student.where({ staff_id: staff_id }).fetchAll();
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
    try {
        const staffId = req.params.id;

        // Find the staff in the database based on the provided ID
        await Staff.findByIdAndDelete(staffId, {tableName: 'staffs'});

    
        // Send a success response
        res.status(200).json({
          status: 'success',
          message: 'Staff details deleted successfully',
          
        });
      } catch (err) {
        // Handle any errors that occur during the process
        const error = new AppError(err.message, 400);
        error.sendResponse(res);
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

    // If the logged-in staff is the same as the staff being viewed or is higher staff, allow access
    if (staffId === loggedInStaffId || isHOD || isPrincipal) {
      // Return the staff details
      return res.status(200).json({
        status: 'success',
        data: {
          staff,
        },
      });
    } else {
      const err= new AppError("Unauthorised access to staff details", 403);
      err.sendResponse(res);
      return;
    }
  } catch (err) {
    // Handle any errors that occur during the process
    const err1= new AppError("Failed to fetch staff details", 500);
      err1.sendResponse(res);
      return;
  }
});


exports.viewMultipleStaff = catchAsync(async (req, res) => {
  
  try {
    const loggedInStaffRole = req.user.roles; // Role of the logged-in staff member
    const loggedInStaffSecSit = req.user.sec_sit; // SEC or SIT value for the logged-in staff
    const isHOD = loggedInStaffRole.includes('hod');
    const isPrincipal = loggedInStaffRole.includes('principal');
    const isCeo = loggedInStaffRole.includes('ceo');

    if (isCeo) {
      // Fetch all staff from the database
      const staffs = await Staff.fetchAll();

      if (!staffs || staffs.length === 0) {
        const err= new AppError("No Staff in the database", 404);
      err.sendResponse(res);
      return;
      }

      // Return the staff details
      return res.status(200).json({
        status: 'success',
        data: {
          staffs,
        },
      });
    } 
    else if (isHOD) {
      // Fetch all staffs in the same department as the HOD
      const department = req.user.department;
      const staffs = await Staff.where({ department:department }).fetchAll();

      if (!staffs || staffs.length === 0) {
        const err= new AppError("No Staff in the department", 404);
      err.sendResponse(res);
      return;
      }

      // Return the staff details
      return res.status(200).json({
        status: 'success',
        data: {
          staffs,
        },
      });
    } else if (isPrincipal) {
      // Fetch all staffs in the same SEC or SIT as the Principal
      const staffs = await Staff.where({ sec_sit: loggedInStaffSecSit }).fetchAll();

      if (!staffs || staffs.length === 0) {
        const err= new AppError("No staff found in ${loggedInStaffSecSit ", 404);
        err.sendResponse(res);
        return;
      }

      // Return the staff details
      return res.status(200).json({
        status: 'success',
        data: {
          staffs,
        },
      });
    } else {
      const err= new AppError("Unauthorised access to view multiple staffs", 403);
      err.sendResponse(res);
      return;
    }
  } 
  catch (err) {
    // Handle any errors that occur during the process
    const err1= new AppError("Failed to fetch Staff details", 500);
    err1.sendResponse(res);
    return;
  }
});

exports.viewMultipleStudent = catchAsync(async (req, res) => {
  
  try {
    const loggedInStaffRole = req.user.roles; // Role of the logged-in staff member
    const loggedInStaffSecSit = req.user.sec_sit; // SEC or SIT value for the logged-in staff
    const isCEOOrTapCell = loggedInStaffRole.includes('ceo') || loggedInStaffRole.includes( 'tapcell');
    const isPrincipal = loggedInStaffRole.includes('principal');
    const isHODOrCoordinator = loggedInStaffRole.includes('hod') || loggedInStaffRole.includes('internshipcoordinator');

    if (isCEOOrTapCell) {
      // Fetch all students from the database
      const students = await Student.fetchAll();

      if (!students || students.length === 0) {
        const err= new AppError("No Student found in the database", 404);
        err.sendResponse(res);
        return;
      }

      // Return the student details
      return res.status(200).json({
        status: 'success',
        data: {
          students,
        },
      });
    } else if (isPrincipal) {
      // Fetch all students from the same SEC or SIT as the Principal
      const students = await Student.where({ sec_sit: loggedInStaffSecSit }).fetchAll();

      if (!students || students.length === 0) {
        const err= new AppError("No Student found in ${loggedInStaffSecSit}", 404);
        err.sendResponse(res);
        return;
      }

      // Return the student details
      return res.status(200).json({
        status: 'success',
        data: {
          students,
        },
      });
    } else if (isHODOrCoordinator) {
      // Fetch all students from the same department as the HOD or Coordinator
      const department = req.user.department;
      const students = await Student.where({ department:department }).fetchAll();

      if (!students || students.length === 0) {
        const err= new AppError("No Student found in the department", 404);
      err.sendResponse(res);
      return;
      }

      // Return the student details
      return res.status(200).json({
        status: 'success',
        data: {
          students,
        },
      });
    } else {
      const err= new AppError("Unauthorised access to view multiple students", 403);
      err.sendResponse(res);
      return;
    }
  } catch (err) {
    // Handle any errors that occur during the process
    const err1= new AppError("Failed to fetch students details", 500);
      err1.sendResponse(res);
      return;
  }
});


