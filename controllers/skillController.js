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
  const { skillName } = req.body;

  if (!skillName) {
    const error =  new AppError('Skill name is required.', 400);
    error.sendResponse(res);
  }

  const existingSkill = await Skill.where({ name: skillName }).fetch();
  if (existingSkill) {
    const err =  new AppError('Skill already exists.', 409);
    err.sendResponse(res);
  }

  const newSkill = await Skill.forge({ name: skillName }).save();

  res.json({
    status: 'success',
    data: {
      skill: newSkill
    }
  });
});

exports.deleteSkill = catchAsync(async (req, res) => {
  const { skillId } = req.params;

  const skill = await Skill.where({ id: skillId }).fetch();
  if (!skill) {
    throw new AppError('Skill not found.', 404);
  }

  await skill.destroy();

  res.json({
    status: 'success',
    message: 'Skill deleted successfully',
  });
});
