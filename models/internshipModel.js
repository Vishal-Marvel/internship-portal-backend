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
  student_id: function() {
    return this.belongsTo(Student);
  },
});

InternshipDetails.findByIdAndUpdate = async function (id, updatedData) {
  try {
    const internship = await InternshipDetails.where({ id }).fetch();
    if (!internship) {
      throw new Error('Internship not found');
    }
    await internship.save(updatedData);
    return internship;
  } catch (err) {
    throw err;
  }
};

InternshipDetails.findByIdAndDelete = async function (id) {
  try {
    const internship = await InternshipDetails.where({ id }).fetch();
    if (!internship) {
      throw new Error('Internship not found');
    }
    await internship.destroy();
  } catch (err) {
    throw err;
  }
};

module.exports = InternshipDetails;
