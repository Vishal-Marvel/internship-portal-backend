const bookshelf = require('../connection');
const { v4: uuidv4 } = require('uuid');

const InternshipDetails = bookshelf.model('InternshipDetails', {
  tableName: 'internship_details',
  initialize: function (){
    this.on('creating', this.setID);
  },
  setID:async function(){
    const uuid = uuidv4(null, null, null);
    this.set('id', uuid.toString());
  },
});

module.exports = InternshipDetails;
