const Student = require('../models/studentModel');
const Skill = require('../models/skillModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const knex = require('knex');

exports.updateStudent = catchAsync(async (req, res) => {
    try {
      let studentId;
      // console.log(req.user)
      if (req.user.roles.includes("student")){
        studentId = req.user.id;
      }
      else{
        studentId = req.body.student_id; // If the student Details is changed by a staff.
      }
        const {
          name,
          sec_sit,
          year_of_studying,
          phone_no,
          total_days_internship,
          placement_status,
          placed_company
      } = req.body;
      const updatedData = {
        name, sec_sit, year_of_studying, phone_no,total_days_internship,
        placement_status,
        placed_company
      }
    
        // Find the student in the database based on the provided ID
        const student = await Student.findByIdAndUpdate(studentId, updatedData, {
          new: true, // Return the updated document
          runValidators: true, // Run the validation on the updated fields
          tableName: 'students' // Specify the table name
        });
    
        if (!student) {
          // If the student with the provided ID is not found, return an error response
          return res.status(404).json({
            status: 'fail',
            message: 'Student not found',
          });
        }
    
        // Send a success response
        res.status(200).json({
          status: 'success',
          message: 'Student details updated successfully',
          data: {
            student,
          },
        });
    }
    catch (err) {
        // Handle any errors that occur during the process
        const error = new AppError(err.message, 400);
        error.sendResponse(res);
    }
});

exports.deleteStudent = catchAsync(async (req, res) => {
  try {
    const studentId = req.user.id;

    // Find the student in the database based on the provided ID
    await Student.findByIdAndDelete(studentId, {tableName: 'students'});


    // Send a success response
    res.status(200).json({
      status: 'success',
      message: 'Student details deleted successfully',
      
    });
  } catch (err) {
    // Handle any errors that occur during the process
    const error = new AppError(err.message, 400);
    error.sendResponse(res);
  }
});

exports.viewStudent = catchAsync(async (req, res) => {
  try {
    const loggedInUserId = req.user.id; 
    const loggedInUserRole = req.user.roles;
    const isHOD = loggedInUserRole.includes('hod');
    const isPrincipal = loggedInUserRole.includes('principal');
    const isInternshipCoordinator = loggedInUserRole.includes('internshipcoordinator');
    const isStudent = loggedInUserRole.includes('student');
    const isMentor = loggedInUserRole.includes('mentor');
    const isCeo = loggedInUserRole.includes('ceo');
    let studentId;
    
    if(isStudent){
      studentId = loggedInUserId;
    }
    else{
      studentId = req.params.id; // ID of the student to view
    }
    // Fetch the student from the database based on the studentId
    const student = await Student.where({ id: studentId }).fetch();

    if (!student) {
      const err= new AppError("No Student found in the database", 404);
      err.sendResponse(res);
      return;
    }

    if (isStudent || isHOD || isPrincipal|| isInternshipCoordinator|| isMentor||isCeo) {
      // Return the student details
      return res.status(200).json({
        status: 'success',
        data: {
          student,
        },
      });
    } else {
      const err= new AppError("Unauthorised access", 403);
      err.sendResponse(res);
      return;
    }
  } 
  catch (err) {
    // Handle any errors that occur during the process
    const err1= new AppError("Failed to fetch student details", 500);
      err1.sendResponse(res);
      return;
  }
  
});

exports.viewStudentInternship = catchAsync(async (req, res) => {

});


// Controller function to delete a particular skill for a specific student
exports.deleteStudentSkill = catchAsync(async (req, res) => {
  const { studentId } = req.params;
  const { skillName } = req.body;

  // Check if the student exists
  const student = await Student.where({ id: studentId }).fetch({ withRelated: 'skills' });
  if (!student) {
    throw new AppError('Student not found.', 404);
  }

  // Find the skill based on the skill name
  const skill = await Skill.where({ name: skillName }).fetch();
  if (!skill) {
    throw new AppError('Skill not found.', 404);
  }

  // Check if the skill exists in the student's skills
  const studentSkill = student.related('skills').find((s) => s.id === skill.id);
  if (!studentSkill) {
    throw new AppError('Skill not found for the student.', 404);
  }

  // Delete the skill for the student
  await student.skills().detach(skill.id);

  res.json({
    status: 'success',
    message: 'Skill deleted successfully for the student',
  });
});

// Controller function to update a skill for a specific student
exports.updateStudentSkill = catchAsync(async (req, res) => {
  const { studentId } = req.params;
  const { skillName, newSkillName } = req.body;

  // Check if the student exists
  const student = await Student.where({ id: studentId }).fetch({ withRelated: 'skills' });
  if (!student) {
    throw new AppError('Student not found.', 404);
  }

  // Find the current skill based on the skill name
  const currentSkill = await Skill.where({ name: skillName }).fetch();
  if (!currentSkill) {
    throw new AppError('Skill not found.', 404);
  }

  // Find the new skill based on the new skill name
  const newSkill = await Skill.where({ name: newSkillName }).fetch();
  if (!newSkill) {
    throw new AppError('New skill not found.', 404);
  }

  // Check if the current skill exists in the student's skills
  const studentSkill = student.related('skills').find((s) => s.id === currentSkill.id);
  if (!studentSkill) {
    throw new AppError('Skill not found for the student.', 404);
  }

  // Update the skill for the student
  await student.skills().detach(currentSkill.id);
  await student.skills().attach(newSkill.id);

  res.json({
    status: 'success',
    message: 'Skill updated successfully for the student',
  });
});
