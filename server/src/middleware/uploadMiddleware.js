/**
 * File upload middleware for account images.
 */

const fs = require("fs");
const path = require("path");
const multer = require("multer");

const uploadsRoot = path.resolve(__dirname, "../../uploads");
const avatarDir = path.join(uploadsRoot, "avatars");
const logoDir = path.join(uploadsRoot, "logos");

[uploadsRoot, avatarDir, logoDir].forEach((directory) => {
    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
    }
});

const imageFileFilter = (req, file, cb) => {
    if (!file.mimetype || !file.mimetype.startsWith("image/")) {
        return cb(new Error("Only image files are allowed"));
    }

    return cb(null, true);
};

const createStorage = (destinationDirectory) =>
    multer.diskStorage({
        destination: (req, file, cb) => cb(null, destinationDirectory),
        filename: (req, file, cb) => {
            const extension = path.extname(file.originalname) || ".jpg";
            cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`);
        },
    });

const createUploader = (destinationDirectory) =>
    multer({
        storage: createStorage(destinationDirectory),
        fileFilter: imageFileFilter,
        limits: {
            fileSize: 5 * 1024 * 1024,
        },
    });

const uploadStudentProfileImage = createUploader(avatarDir).single("profileImage");
const uploadCompanyLogo = createUploader(logoDir).single("logo");

module.exports = {
    uploadStudentProfileImage,
    uploadCompanyLogo,
};
