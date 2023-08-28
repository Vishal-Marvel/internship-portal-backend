const bookshelf = require('../connection');
const Staff = require('./staffModel')
const {v4: uuidv4} = require("uuid");

const Notification = bookshelf.model('Notification', {
  tableName: 'notification',
  initialize: function (){
    this.on('creating', this.setId);
  },
  setId:async function(){
    const uuid = uuidv4(null, null, null);
    this.set('id', uuid.toString());
  },
  faculty() {
    return this.belongsTo('Staff', 'staff_id'); 
  },
});

module.exports = Notification;
