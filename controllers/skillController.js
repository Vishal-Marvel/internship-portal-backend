const Student = require('../models/studentModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const knex = require('knex');
const Skill = require('../models/skillModel');

// To add a new skill
exports.addSkill = catchAsync(async (req, res)=>{
    try{
        const skill_name=req.body.skill_name
        const skill = new Skill({
            skill_name
        })
        await skill.save();
        res.status(200).json({
            status: "success",
            message: "Skill Added"
        })
    }catch(e){
        if (e.code==="ER_DUP_ENTRY") {
            const error = new AppError("Skill already Exists", 400);
            error.sendResponse(res);
        }
        else{
            const error = new AppError(e.message, 500);
            error.sendResponse(res);
        }
    }
})
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

  // Check if the skill name is provided
  if (!skillName) {
    throw new AppError('Skill name is required.', 400);
  }

  // Check if the skill already exists
  const existingSkill = await Skill.where({ name: skillName }).fetch();
  if (existingSkill) {
    throw new AppError('Skill already exists.', 409);
  }

  // Create a new skill in the database
  const newSkill = await Skill.forge({ name: skillName }).save();

  res.json({
    status: 'success',
    data: {
      skill: newSkill
    }
  });
});

// Controller function to delete a skill
exports.deleteSkill = catchAsync(async (req, res) => {
  const { skillId } = req.params;

  // Check if the skill exists
  const skill = await Skill.where({ id: skillId }).fetch();
  if (!skill) {
    throw new AppError('Skill not found.', 404);
  }

  // Delete the skill from the database
  await skill.destroy();

  res.json({
    status: 'success',
    message: 'Skill deleted successfully',
  });
});