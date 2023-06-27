const bookshelf = require('../connection')
const { v4: uuidv4 } = require('uuid');
const Student = require("./studentModel")
const bcrypt = require("bcrypt");

const StaffModel = bookshelf.model('staffs', {
    tableName: 'staffs',
    initialize: function (){
        this.on('creating', this.setID);
        this.on('creating', this.chkUnique);
        this.on('creating', this.encryptPassword);

    },
    setID:async function(){
        const uuid = uuidv4(null, null, null);
        this.set('id', uuid.toString());
    },
    students: function() {
        return this.hasMany(Student, 'staff_id');
    },
    chkUnique:async function (){
        const email = this.get('email');
        const testStudent = await StaffModel.where({ email }).fetchAll();
        if (testStudent.length>0){
            throw Error("Staff Already Exists");
        }
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

module.exports = StaffModel;
