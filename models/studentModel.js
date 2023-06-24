const bookshelf = require('../connection');
const bcrypt = require('bcrypt');

const Student = bookshelf.model('Student', {
  tableName: 'students',
  response: function() {
    return this.hasMany('Response');
  },
  initialize: function() {
    this.on('creating', this.encryptPassword);
    // this.on('creating', this.studentIdUnique);
    this.on('saving', this.updatePasswordChangedAt);
  },
  encryptPassword: async function() {
    if (!this.hasChanged('password')) {
      return;
    }
    const hashedPassword = await bcrypt.hash(this.get('password'), 10);
    this.set('password', hashedPassword);
  },
  updatePasswordChangedAt: function() {
    if (!this.hasChanged('password') || this.isNew()) {
      return;
    }
    this.set('passwordChangedAt', new Date());
  },
  verifyPassword: async function(candidatePassword) {
    const password = this.get('password');
    return await bcrypt.compare(candidatePassword, password);
  },
  compareChangedPasswordTime: function(JWTTimeStamp) {
    const passwordChangedAt = this.get('passwordChangedAt');
    if (passwordChangedAt) {
      const timeStamp = passwordChangedAt.getTime() / 1000;
      return timeStamp > JWTTimeStamp;
    }
    // Password changed before JWTTimeStamp
    return false;
  }

});

module.exports = Student;
