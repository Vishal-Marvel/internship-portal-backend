// Install the bookshelf, knex, and mysql packages
// npm install bookshelf knex mysql

const knex = require('knex')({
    client: 'mysql',
    connection: {
        host: 'localhost',
        user: 'root',
        password: 'vishal@sql',
        database: 'internship_portal'
    }
});

const bookshelf = require('bookshelf')(knex);

// Check if the table exists, and create it if it doesn't

knex.schema.hasTable('students').then(exists => {
    if (!exists) {
        return knex.schema.createTable('students', table => {
            table.increments('id').primary();
            table.string('name');
            table.string('sec_sit');
            table.string('student_id').unique();
            table.integer('year_of_studying');
            table.string('department');
            table.string('email');
            table.string('phone_no');
            table.string('mentor_name');
            table.string('mentor_email');
            table.string('password');
        });
    }
});

knex.schema.hasTable('internships').then(exists => {
    if (!exists) {
        return knex.schema.createTable('internships', table => {
            table.increments('id').primary();
            table.string('company_name');
            table.string('sin_tin_gst_no');
            table.string('mode_of_intern');
            table.date('starting_date');
            table.date('ending_date');
            table.integer('days_of_internship');
            table.string('location');
            table.binary('pdf_of_verified_OD_letter');
            table.string('domain');
            table.string('skills');
            table.binary('certificate_of_completion');
        });
    }
});

// Export the bookshelf connection
module.exports = bookshelf;
