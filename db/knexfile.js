const dotenv = require("dotenv");
dotenv.config({ path: '../config.env' });

module.exports = {
    development: {
        client: 'mysql',
        connection: {
            host: process.env.HOST_NAME,
            user: process.env.USER_NAME,
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