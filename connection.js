const dotenv = require("dotenv");
dotenv.config({ path: './config.env' });
const knexConfig = require('./db/knexfile');
const knex = require('knex')(knexConfig[process.env.NODE_ENV]);

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
            table.integer('total_days_internship');
            table.boolean('placement_status');
            table.string('placed_company');
            table.date('registered_date');
            // table.string('skills');
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
            table.string('sec_sit');
            table.date('registered_date');
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
            table.date('registered_date');
            table.string('company_name');
            table.string('company_address');
            table.string('company_ph_no');
            table.string('current_cgpa');
            table.string('sin_tin_gst_no');
            table.string('academic_year');
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
            table.string('mentor_id')
            table.date('mentor_approved_at')
            table.boolean('internship_coordinator')
            table.string('internship_coordinator_id')
            table.date('internship_coordinator_approved_at')
            table.boolean('hod')
            table.string('hod_id')
            table.date('hod_approved_at')
            table.boolean('tap_cell')
            table.string('tap_cell_id')
            table.date('tap_cell_approved_at')
            table.boolean('principal')
            table.string('principal_id')
            table.date('principal_approved_at')
            table.string('comments')
            table.string('comments_by_id')
            table.string('comments_by_Role')
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
            table.date('uploaded_at');
        })
    }
})

// Export the bookshelf connection
module.exports = bookshelf;
