const bookshelf = require('../connection');

const Response = bookshelf.model('Response', {
  tableName: 'responses',
  student: function() {
    return this.belongsTo('Student', 'student_id');
  },
  internshipDetails: function() {
    return this.belongsTo('InternshipDetails', 'internship_id');
  },
  appliedAt: {
    type: Date,
    defaultTo: new Date()
  }
});

module.exports = Response;
