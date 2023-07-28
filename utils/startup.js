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
        
        const internship_coordinator = new Role({
            role_name: "internship_coordinator"
        });
        await internship_coordinator.save();

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
