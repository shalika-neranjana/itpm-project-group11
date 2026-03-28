/**
 * File upload middleware for images and documents.
 */

const fs = require("fs");
const path = require("path");
const multer = require("multer");

const uploadsRoot = path.resolve(__dirname, "../../uploads");
const avatarDir = path.join(uploadsRoot, "avatars");
const logoDir = path.join(uploadsRoot, "logos");
const resumeDir = path.join(uploadsRoot, "resumes");

[uploadsRoot, avatarDir, logoDir, resumeDir].forEach((directory) => {
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

const pdfFileFilter = (req, file, cb) => {
    const extension = path.extname(file.originalname || "").toLowerCase();
    const isPdfMime = file.mimetype === "application/pdf";
    const isPdfExtension = extension === ".pdf";

    if (!isPdfMime && !isPdfExtension) {
        return cb(new Error("Only PDF files are allowed"));
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

const createPdfUploader = (destinationDirectory) =>
    multer({
        storage: createStorage(destinationDirectory),
        fileFilter: pdfFileFilter,
        limits: {
            fileSize: 5 * 1024 * 1024,
        },
    });

const uploadStudentProfileImage = createUploader(avatarDir).single("profileImage");
const uploadCompanyLogo = createUploader(logoDir).single("logo");
const uploadResumePdf = createPdfUploader(resumeDir).single("resume");

module.exports = {
    uploadStudentProfileImage,
    uploadCompanyLogo,
    uploadResumePdf,
};
