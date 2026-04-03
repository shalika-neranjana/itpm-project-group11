/**
 * Authentication middleware.
 * Protects routes using JWT tokens.
 */

const jwt = require("jsonwebtoken");
const Student = require("../models/Student");

const protect = async (req, res, next) => {
    let token;

    try {
        // Check if Authorization header exists
        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {

            // Extract token
            token = req.headers.authorization.split(" ")[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Attach student data to request
            const student = await Student.findById(decoded.id).select("-password");

            if (!student) {
                return res.status(401).json({
                    success: false,
                    message: "Not authorized. User not found.",
                });
            }

            req.student = student;
            next();
        } else {
            return res.status(401).json({
                success: false,
                message: "Not authorized. Token missing."
            });
        }

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Not authorized. Token failed."
        });
    }
};

protect.protectStudent = protect;
module.exports = protect;
