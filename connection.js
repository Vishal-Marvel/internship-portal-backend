// Install the bookshelf, knex, and mysql packages
// npm install bookshelf knex mysql

const knex = require('knex')({
    client: 'mysql',
    connection: {
        host: 'localhost',
        user: 'root',
        password: process.env.SQL_PASSWORD,
        database: process.env.DATABASE
    }
});

const bookshelf = require('bookshelf')(knex);

// Check if the table exists, and create it if it doesn't

knex.schema.hasTable('students').then(exists => {
    if (!exists) {
        return knex.schema.createTable('students', table => {
            table.string('id').primary();
            table.string('name');
            table.string('sec_sit');
            table.string('student_id').unique();
            table.integer('year_of_studying');
            table.string('register_num');
            table.string('department');
            table.string('email').unique();
            table.string('phone_no');
            table.string('password');
            table.string('skills');
            table.string('staff_id'); // Add staff_id column for the foreign key
            table.foreign('staff_id').references('staffs.id'); // Add foreign key constraint
        });
    }
});

knex.schema.hasTable('staffs').then(exists => {
    if (!exists) {
        return knex.schema.createTable('staffs', table => {
            table.string('id').primary();
            table.string('name');
            table.string('department');
            table.string('email').unique();
            table.string('phone_no');
            table.string('role');
            table.string('password');
        });
    }
});

knex.schema.hasTable('internships').then(exists => {
    if (!exists) {
        return knex.schema.createTable('internships', table => {
            table.string('id').primary();
            table.string('company_name');
            table.string('company_address');
            table.string('company_ph_no');
            table.string('current_cgpa');
            table.string('sin_tin_gst_no');
            table.string('industry_supervisor_name');
            table.string('industry_supervisor_ph_no');
            table.string('mode_of_intern');
            table.date('starting_date');
            table.date('ending_date');
            table.integer('days_of_internship');
            table.string('location');
            table.string('domain');
            table.string('certificate_of_completion');
            table.string('offer_letter');
            table.string('student_id').references('students.id').onDelete('CASCADE');
        });
    }
});


knex.schema.hasTable("approval").then(exists=>{
    if (!exists){
        return knex.schema.createTable("approval",table=>{
            table.string('id').primary()
            table.boolean('mentor')
            table.boolean('hod')
            table.boolean('tap_cell')
            table.boolean('principal')
            table.string('comments')
            table.string('internship_id').references('internships.id').onDelete('CASCADE');

        })
    }
})

knex.schema.hasTable("files").then(exists =>{
    if (!exists){
        return knex.schema.createTable('files', table=>{
            table.string('id').primary();
            table.string('file_name').unique();
            table.binary('file');
        })
    }
})

// Export the bookshelf connection
module.exports = bookshelf;
