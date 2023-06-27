const bookshelf = require('../connection');
const internship = require('./internshipModel');
const {v4: uuidv4} = require("uuid");
const approval = bookshelf.model('Approval', {
    tableName: 'approval',
    initialize: function (){
        this.on('creating', this.setId);
    },
    setId:async function(){
        const uuid = uuidv4(null, null, null);
        this.set('id', uuid.toString());
    },
    internship_id: function() {
        return this.belongsTo(internship);
    },
});

module.exports = approval;
