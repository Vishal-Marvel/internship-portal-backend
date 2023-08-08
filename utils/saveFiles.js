const AppError = require("./appError");
const File = require("../models/fileModel");

async function savePhoto(buffer, mimetype, fileName, originalname) {
    try {
        if (!mimetype.startsWith('image')) {
            throw new AppError('File type is invalid', 400);
        }

        const file = new File({
            file_name: fileName,
            file: buffer
        });

        await file.save();

        return file.id;
    }
    catch (e){
        if (e.code === 'ER_DATA_TOO_LONG'){
            throw new AppError(`File ${originalname} is too large`,  400);
        }
        else{
            throw new AppError(e.message,  500);
        }
    }
}

async function saveFile(buffer, mimetype, fileName, originalname) {
    try {
        if (mimetype !== 'application/pdf') {
            throw new AppError('File type is invalid', 400);
        }

        const file = new File({
            file_name: fileName,
            file: buffer
        });

        await file.save();

        return file.id;
    }
    catch (e){
        if (e.code === 'ER_DATA_TOO_LONG'){
            throw new AppError(`File ${originalname} is too large`,  400);
        }
        else{
            throw new AppError(e.message,  500);
        }
    }
}

module.exports = {
    savePhoto,
    saveFile
};
