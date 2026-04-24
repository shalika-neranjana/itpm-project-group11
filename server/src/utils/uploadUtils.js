const fs = require("fs");

const deleteUploadedFile = (file) => {
    if (!file?.path) {
        return;
    }

    if (!fs.existsSync(file.path)) {
        return;
    }

    try {
        fs.unlinkSync(file.path);
    } catch (error) {
        // Ignore cleanup failures so the original request error is preserved.
    }
};

const getUploadedFilePath = (file, folderName, fallbackValue = "") => {
    if (!file?.filename) {
        return fallbackValue;
    }

    return `/uploads/${folderName}/${file.filename}`;
};

module.exports = {
    deleteUploadedFile,
    getUploadedFilePath,
};
