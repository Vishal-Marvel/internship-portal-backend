const bookshelf = require('../connection')
const { v4: uuidv4 } = require('uuid');
const Student = require("./studentModel")
const Skill = bookshelf.model('Skill', {
    tableName: 'skills', 
        initialize: function (){
            this.on('creating', this.setID);
    
        },
        setID:async function(){
            const uuid = uuidv4(null, null, null);
            this.set('id', uuid.toString());
    
        },
        students() {
            return this.belongsToMany(Student, 'student_skill', 'skill_id', 'student_id');
        },

  });
  
  module.exports = Skill;
