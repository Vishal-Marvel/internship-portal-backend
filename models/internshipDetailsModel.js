const bookshelf = require('../connection');
const InternshipDetails = bookshelf.model('InternshipDetails', {
  tableName: 'internship_details',
});

module.exports = InternshipDetails;
