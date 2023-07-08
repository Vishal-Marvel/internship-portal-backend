const bookshelf = require('../connection')
const { v4: uuidv4 } = require('uuid');
const Student = require("./studentModel")
const Role = require("./roleModel")
const bcrypt = require("bcrypt");

const StaffModel = bookshelf.model('staffs', {
    tableName: 'staffs',
    initialize: function (){
        this.on('creating', this.setID);
        this.on('creating', this.encryptPassword);

    },
    setID:async function(){
        const uuid = uuidv4(null, null, null);
        this.set('id', uuid.toString());
        this.set('registered_date', new Date());

    },
    students: function() {
        return this.hasMany(Student, 'staff_id');
    },
    roles() {
        return this.belongsToMany(Role, 'staff_roles', 'staff_id', 'role_id');
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
});


StaffModel.findByIdAndUpdate = async function (id, updatedData) {
    try {
      const staff = await StaffModel.where({id}).fetch();
      if (!staff) {
        throw new Error('Staff not found');
      }
      await staff.save(updatedData);
      return staff;
    } 
    catch (err) {
      throw err;
    }
  };
  
  StaffModel.findByIdAndDelete = async function (id) {
    try {
      const staff = await StaffModel.where({id}).fetch();
      if (!staff) {
        throw new Error('Staff not found');
      }
      await staff.destroy();
    } 
    catch (err) {
      throw err;
    }
  };
  
module.exports = StaffModel;
