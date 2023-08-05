const Role = require("../models/roleModel");
const AppError = require("./appError");
const Staff = require("../models/staffModel");
const fs = require('fs');
const File = require("../models/fileModel");
exports.performStartUp = async function () {
// Create the user
    try {

        const admin = new Role({
            role_name: "admin"
        });
        await admin.save();
        
        const internshipcoordinator = new Role({
            role_name: "internshipcoordinator"
        });
        await internshipcoordinator.save();

        const mentor = new Role({
            role_name: "mentor"
        });
        await mentor.save();

        const principal = new Role({
            role_name: "principal"
        });
        await principal.save();


        const tap_cell = new Role({
            role_name: "tapcell"
        });
        await tap_cell.save();

        const hod = new Role({
            role_name: "hod"
        });
        await hod.save();

        const ceo = new Role({
            role_name: "ceo"
        });
        await ceo.save();


    } catch (e) {
        if (e.code === "ER_DUP_ENTRY") {

        } else {
            throw new AppError(e.message, 500);
        }
    }
    try {
        const role = await Role.where({role_name: "admin"}).fetch();

        const admin = new Staff({
            name: "admin",
            email: "admin@website",
            password: "admin23"
        });

        await admin.save();
        await admin.roles().attach(role);

    } catch (e) {
        if (e.code === "ER_DUP_ENTRY") {
        } else {
            throw new AppError(e.message, 500);
        }
    }
        // Path to the file on the server
        const filePath = 'public/images/logo.jpg';

        // Read the file using fs.readFile
        fs.readFile(filePath, 'utf8', async (err, data) => {
            if (err) {
                console.error('Error reading file:', err);
                return;
            }

            try {
                const chk_file = await File.where({file_name: "default_profile_photo"}).fetchAll();
                if (chk_file.length === 0) {

                // Save the file data to the database using the File model
                const file = new File({file: data, file_name: "default_profile_photo"}); // 'data' is the column name in the 'files' table where you want to store the file content
                await file.save();

                console.log('Profile Photo saved to the database');
                }
            } catch (error) {
                console.error('Error saving file data to the database:', error);
            }
        });



    console.log('Startup tasks completed');
}
