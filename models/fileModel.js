const { v4: uuidv4 } = require('uuid');
const bookshelf = require('../connection');

const File = bookshelf.model('File', {
    tableName: 'files',
    initialize: function (){
        this.on('creating' , this.setID);
    },
    setID:async function(){
        const uuid = uuidv4(null, null, null);
        this.set('id', uuid.toString());
        this.set('uploaded_at', new Date());
    },
})
module.exports = File;
