const Role = require("../models/roleModel");
const AppError = require("./appError");
const Staff = require("../models/staffModel");

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

    console.log('Startup tasks completed');
}
