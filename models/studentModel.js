const bookshelf = require('../connection');
const Internship = require("./internshipModel")
const { v4: uuidv4 } = require('uuid');
const Staff = require('./staffModel')

const bcrypt = require('bcrypt');

const Student = bookshelf.model('Student', {
  tableName: 'students',
  initialize: function() {
    this.on('creating', this.encryptPassword);
    this.on('creating', this.setID);
    this.on('creating', this.studentIdUnique);
    // this.on('saving', this.updatePasswordChangedAt);
  },
  internship: function() {
    return this.hasOne(Internship);
  },
  staff: function() {
    return this.belongsTo(Staff, 'staff_id');
  },
  setID:async function(){
    const uuid = uuidv4(null, null, null);
    this.set('id', uuid.toString());
  },
  encryptPassword: async function() {
    if (!this.hasChanged('password')) {
      return;
    }
    const hashedPassword = await bcrypt.hash(this.get('password'), 10);
    this.set('password', hashedPassword);
  },
  verifyPassword: async function(candidatePassword) {
    const password = this.get('password');
    return await bcrypt.compare(candidatePassword, password);
  },
  studentIdUnique: async  function(){
    const student_id = this.get('student_id');
    const testStudent = await Student.where({ student_id }).fetchAll();
    if (testStudent.length>0){
      throw Error("Student Id Already Exists");
    }
  }


});

module.exports = Student;
