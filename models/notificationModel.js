const bookshelf = require('../connection');
const Staff = require('./staffModel')

const Notification = bookshelf.model('Notification', {
  tableName: 'notifications',
  faculty() {
    return this.belongsTo('Staff', 'staff_id'); 
  },
});

module.exports = Notification;
