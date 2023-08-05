const Student = require('../models/studentModel');
const Skill = require('../models/skillModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const File = require("../models/fileModel");

exports.updateStudent = catchAsync(async (req, res) => {
    try {
        const studentId = req.user.id;
        const {
          name,
          year_of_studying,
          phone_no,
          skills
      } = req.body;
      const updatedData = {
        name, year_of_studying, phone_no
      }
        const student = await Student.findByIdAndUpdate(studentId, updatedData, {
          new: true,
          runValidators: true,
          tableName: 'students'
        });

      if (!student) {
        const err = new AppError("Student not found", 404);
        err.sendResponse(res);
        return;
      }
      const existingSkills = await student.related('skills').pluck('skill_name');
      const skillsToDelete = existingSkills.filter((skill_id) => !skills.includes(skill_id));
      const skillsToAdd = skills.filter((skill_id) => !existingSkills.includes(skill_id));
      console.log(existingSkills, skillsToDelete, skillsToAdd);
      const allSkills = await Skill.fetchAll();
      const skillNames = allSkills.map(skill => skill.get('skill_name'));
      const errors = [];

      skillsToAdd.forEach((skill) => {
        if (!skillNames.includes(skill)){
          errors.push(`${skill} Not Found`);
        }
      })
      if (errors.length>0){
        const err = new AppError(errors, 404);
        err.sendResponse(res);
        return;
      }
      const skillsToDeleteObj = await Promise.all(skillsToDelete.map(async skill => await Skill.where({skill_name: skill}).fetch()));
      const skillsToAddObj = await Promise.all(skillsToAdd.map(async skill => await Skill.where({skill_name: skill}).fetch()));
      const skillsToDeleteIds = skillsToDeleteObj.map(skill => skill.get('id'));
      const skillsToAddIds = skillsToAddObj.map(skill => skill.get('id'));

      student.skills().detach(skillsToDeleteIds);

      student.skills().attach(skillsToAddIds);

      const updatedStudentWithSkills = await Student.forge({id: studentId}).fetch({withRelated: 'skills'});

        res.status(200).json({
          status: 'success',
          message: 'Student details and skills updated successfully',
          data: {
            student: updatedStudentWithSkills.toJSON(),
          },
        });
  } catch (err) {
      if (err.message === "EmptyResponse"){
        const error = new AppError("Student Not Found", 404);
        error.sendResponse(res);
      }
      else {
        const error = new AppError(err.message, 500);
        error.sendResponse(res);
      }
  }
});

exports.updateStudentByStaff = catchAsync(async (req, res) => {
    try {
        const studentId = req.params.id;
        const {
          name,
          year_of_studying,
          phone_no,
          placement_status,
          placed_company
      } = req.body;
      const updatedData = {
        name, year_of_studying, phone_no,placement_status,
        placed_company
      }
      const student = await Student.findByIdAndUpdate(studentId, updatedData, {
        new: true,
        runValidators: true,
        tableName: 'students'
      });

      if (!student) {
        const err = new AppError("Student not found", 404);
        err.sendResponse(res);
        return;
      }

      const updatedStudentWithSkills = await Student.where({id: studentId}).fetch({withRelated: 'skills'});

      res.status(200).json({
        status: 'success',
        message: 'Student details updated successfully',
        data: {
          student: updatedStudentWithSkills.toJSON(),
        },
      });
  } catch (err) {
      if (err.message === "EmptyResponse"){
        const error = new AppError("Student Not Found", 404);
        error.sendResponse(res);
      }
      else {
        const error = new AppError(err.message, 500);
        error.sendResponse(res);
      }
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
    if (err.message === "EmptyResponse"){
      const error = new AppError("Student Not Found", 404);
      error.sendResponse(res);
    }
    else {
      const error = new AppError(err.message, 500);
      error.sendResponse(res);
    }
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

    if (isStudent) {
      studentId = loggedInUserId;
    } else if (!req.params.id) {
      const err = new AppError("Student Id is required", 403);
      err.sendResponse(res);
      return;
    } else {
      studentId = req.params.id; // ID of the student to view
    }
    // Fetch the student from the database based on the studentId
    const student = await Student.where({ id: studentId }).fetch({ withRelated: 'skills' });

    if (!student) {
      const err= new AppError("Student not Found", 404);
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
    }
  } 
  catch (err) {
    // Handle any errors that occur during the process
    const err1= new AppError("Failed to fetch student details", 500);
      err1.sendResponse(res);
  }
  
});

exports.getProfilePhoto = catchAsync(async (req, res) => {
  try{
    const file = File.where({id: req.params.id}).fetch();
   res.send(file.get('file'));
  }
  catch(e){
    if (e.message === "EmptyResponse"){
      const er = new AppError("Image Not Found", 404);
      er.sendResponse(res);
    }
  }
})

exports.viewStudentInternship = catchAsync(async (req, res) => {

});


