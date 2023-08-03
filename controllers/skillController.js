const Student = require('../models/studentModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const knex = require('knex');
const Skill = require('../models/skillModel');

// Controller function to get all skills
exports.getAllSkills = catchAsync(async (req, res) => {
  const skills = await Skill.fetchAll();
  res.json({
    status: 'success',
    data: {
      skills
    }
  });
});

// Controller function to add a new skill
exports.addSkill = catchAsync(async (req, res) => {
  try {
    const { skillName } = req.body;

    if (!skillName) {
      const error =  new AppError('Skill name is required.', 400);
      error.sendResponse(res);
    }

    const newSkill = await Skill.forge({ skill_name: skillName }).save();

    res.json({
      status: 'success',
      data: {
        skill: newSkill
      }
    });
  }
  catch (e){
    if (e.code === 'ER_DUP_ENTRY'){
      const err = new AppError("Skill Already Exists", 409);
      err.sendResponse(res);
    }
    else{
      const err = new AppError(e.message, 500);
      err.sendResponse(res);
    }
  }

});

exports.deleteSkill = catchAsync(async (req, res) => {
  try {
    const {skillId} = req.params;

    const skill = await Skill.where({id: skillId}).fetch();

    await skill.destroy();

    res.json({
      status: 'success',
      message: 'Skill deleted successfully',
    });
  }
  catch (e){
    if (e.message === "EmptyResponse"){
      const err = new AppError("Skill Doesn't Exists", 409);
      err.sendResponse(res);
    }
    else{
      const err = new AppError(e.message, 500);
      err.sendResponse(res);
    }
  }
});
