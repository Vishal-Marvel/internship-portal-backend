const dotenv = require("dotenv");
dotenv.config({ path: '../config.env' });

module.exports = {
    development: {
        client: 'mysql',
        connection: {
            host: 'localhost',
            user: 'root',
            password: process.env.SQL_PASSWORD,
            database: process.env.DATABASE
        },
        migrations: {
            tableName: 'knex_migrations',
            directory: './migrations',
        },
        useNullAsDefault: true
    }
};