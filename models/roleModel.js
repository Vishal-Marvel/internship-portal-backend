const bookshelf = require('../connection')
const { v4: uuidv4 } = require('uuid');
const Staff = require("./staffModel")

const Role = bookshelf.model('Role', {
    tableName: 'roles',
    initialize: function (){
        this.on('creating', this.setID);

    },
    setID:async function(){
        const uuid = uuidv4(null, null, null);
        this.set('id', uuid.toString());

    },
    users() {
        return this.belongsToMany(Staff, 'staff_roles', 'role_id', 'staff_id');
    },
});

module.exports = Role