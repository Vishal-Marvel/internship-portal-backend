const bookshelf = require('../connection');
const { v4: uuidv4 } = require('uuid');
const Student = require("./studentModel")
const InternshipDetails = bookshelf.model('InternshipDetails', {
  tableName: 'internships',
  initialize: function (){
    this.on('creating', this.setID);
  },
  setID:async function(){
    const uuid = uuidv4(null, null, null);
    this.set('id', uuid.toString());
  },
  student: function() {
    return this.belongsTo(Student);
  },
});

module.exports = InternshipDetails;
